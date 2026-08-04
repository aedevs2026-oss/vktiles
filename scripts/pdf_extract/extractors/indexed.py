"""Indexed (link-based) PDF extractor for legacy interactive catalogs."""
from __future__ import annotations

import fitz
import numpy as np
from PIL import Image

from ..constants import INDEX_MIN_LINKS, SKIP_NAME_TOKENS
from ..images import abs_image_path, load_image_from_xref, rel_image_path, save_webp
from ..product_builder import RawProduct
from ..utils import clean_ocr_text, slugify


class IndexedExtractor:
    def __init__(self, scale: float = 2.0, label_height: float = 40.0, ocr=None):
        self.scale = scale
        self.label_height = label_height
        self.ocr = ocr

    def ocr_array(self, arr: np.ndarray) -> list[str]:
        result, _ = self.ocr(arr)
        return [line[1] for line in (result or [])]

    def render_page(self, page: fitz.Page) -> Image.Image:
        pix = page.get_pixmap(matrix=fitz.Matrix(self.scale, self.scale))
        return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    def ocr_label_crop(self, page_img: Image.Image, rect: fitz.Rect) -> str:
        x0 = int(rect.x0 * self.scale)
        y0 = int(rect.y1 * self.scale)
        x1 = int(rect.x1 * self.scale)
        y1 = min(int((rect.y1 + self.label_height) * self.scale), page_img.height)
        if y1 <= y0 or x1 <= x0:
            return ""
        crop = np.array(page_img.crop((x0, y0, x1, y1)))
        lines = self.ocr_array(crop)
        return clean_ocr_text(" ".join(lines))

    def save_page_image(self, doc: fitz.Document, page_num: int, dest) -> bool:
        page = doc[page_num]
        imgs = page.get_images(full=True)
        if not imgs:
            return False
        img = load_image_from_xref(doc, imgs[0][0])
        if img is None:
            return False
        return save_webp(img, dest)

    def find_index_pages(self, doc: fitz.Document) -> list[int]:
        pages = []
        for i in range(doc.page_count):
            links = [
                l
                for l in doc[i].get_links()
                if l.get("kind") == fitz.LINK_GOTO and l.get("page") is not None
            ]
            if len(links) >= INDEX_MIN_LINKS:
                pages.append(i)
        return pages

    def extract_name_from_full_page(self, page_img: Image.Image) -> str | None:
        arr = np.array(page_img)
        lines = [clean_ocr_text(x) for x in self.ocr_array(arr)]
        candidates = []
        for line in lines:
            if len(line) < 4:
                continue
            if any(tok in line for tok in SKIP_NAME_TOKENS):
                words = [w for w in line.split() if w not in SKIP_NAME_TOKENS]
                if len(words) >= 2:
                    candidates.append(" ".join(words))
                continue
            if any(c.isalpha() for c in line):
                candidates.append(line)
        if not candidates:
            return None
        candidates.sort(key=len, reverse=True)
        return candidates[0]

    def extract_indexed(self, pdf_path, meta: dict, root, used_slugs: set[str]) -> list[RawProduct]:
        doc = fitz.open(pdf_path)
        series_slug = meta["series_slug"]
        index_pages = self.find_index_pages(doc)
        if not index_pages:
            doc.close()
            return []

        products: list[RawProduct] = []
        seen_pages: set[int] = set()

        for index_page_num in index_pages:
            page = doc[index_page_num]
            page_img = self.render_page(page)
            links = [
                l
                for l in page.get_links()
                if l.get("kind") == fitz.LINK_GOTO and l.get("page") is not None
            ]
            for link in links:
                target_page = int(link["page"])
                if target_page in seen_pages:
                    continue
                seen_pages.add(target_page)

                name = self.ocr_label_crop(page_img, link["from"])
                if not name or len(name) < 3:
                    name = f"Product Page {target_page + 1}"

                base_slug = slugify(name) or f"page-{target_page}"
                product_slug = base_slug
                idx = 2
                while product_slug in used_slugs:
                    product_slug = f"{base_slug}-{idx}"
                    idx += 1
                used_slugs.add(product_slug)

                rel = rel_image_path(series_slug, product_slug)
                dest = abs_image_path(root, rel)
                if not self.save_page_image(doc, target_page, dest):
                    continue

                products.append(
                    RawProduct(
                        name=name,
                        series_slug=series_slug,
                        product_slug=product_slug,
                        page=target_page,
                        image_paths=[rel],
                        meta=dict(meta),
                    )
                )

        doc.close()
        return products

    def extract_sequential(self, pdf_path, meta: dict, root, used_slugs: set[str]) -> list[RawProduct]:
        doc = fitz.open(pdf_path)
        series_slug = meta["series_slug"]
        start = int(meta.get("start_page", 5))
        products: list[RawProduct] = []

        for page_num in range(start, doc.page_count):
            page = doc[page_num]
            page_img = self.render_page(page)
            name = self.extract_name_from_full_page(page_img)
            if not name:
                continue

            base_slug = slugify(name) or f"page-{page_num}"
            product_slug = base_slug
            idx = 2
            while product_slug in used_slugs:
                product_slug = f"{base_slug}-{idx}"
                idx += 1
            used_slugs.add(product_slug)

            rel = rel_image_path(series_slug, product_slug)
            dest = abs_image_path(root, rel)
            if not self.save_page_image(doc, page_num, dest):
                continue

            products.append(
                RawProduct(
                    name=name,
                    series_slug=series_slug,
                    product_slug=product_slug,
                    page=page_num,
                    image_paths=[rel],
                    meta=dict(meta),
                )
            )

        doc.close()
        return products
