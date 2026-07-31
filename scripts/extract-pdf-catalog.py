#!/usr/bin/env python3
"""
Extract product catalog from VKPdf folder PDFs.

Reads index-page links + OCR labels for names, extracts embedded JPEGs from
product pages, writes WebP assets under public/products/vk-pdf/, and emits
content/valenza-catalog.json.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

import fitz
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "VKPdf"
OUT_IMG_DIR = ROOT / "public" / "products" / "vk-pdf"
CATALOG_PATH = ROOT / "content" / "vk-catalog.json"

FEATURES = [
    "Low Water Absorption",
    "High Breaking Strength",
    "Frost Resistant",
    "Stain Resistant",
    "Easy Maintenance",
    "ISO 9001:2015 Certified",
]

APPLICATIONS = {
    "gvt-pgvt": ["Living Room", "Bedroom", "Commercial Spaces", "Hotels", "Office"],
    "wooden-strip": ["Living Room", "Bedroom", "Commercial Spaces"],
}

PACKING = {
    "600x1200 MM": {
        "thickness": "9 MM",
        "tilesPerBox": 2,
        "coverage": "1.44 SQM",
        "weight": "30 KG",
    },
}

PDF_CONFIGS = {
    "MATT.pdf": {
        "series_slug": "matt",
        "collection": "Matt Collection",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Random",
    },
    "WOODEN MATT.pdf": {
        "series_slug": "wooden-matt",
        "collection": "Wood Collection",
        "category": "wooden-strip",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Matt Wood",
        "pattern": "Wood",
    },
    "GLOSSY ENDLESS 1.pdf": {
        "series_slug": "glossy-endless-1",
        "collection": "Glossy Endless",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
    },
    "GLOSSY ENDLESS 2.pdf": {
        "series_slug": "glossy-endless-2",
        "collection": "Glossy Endless 2",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
    },
    "GLOSSY RANDOM 1.pdf": {
        "series_slug": "glossy-random-1",
        "collection": "Glossy Random",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "GLOSSY RANDOM 2.pdf": {
        "series_slug": "glossy-random-2",
        "collection": "Glossy Random 2",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "GLOSSY STAUARIO & ONYX.pdf": {
        "series_slug": "glossy-statuario-onyx",
        "collection": "Glossy Statuario & Onyx",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Marble",
    },
    "HIGH GLOSSY.pdf": {
        "series_slug": "high-glossy",
        "collection": "High Glossy",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "NEW GLOSSY 2.pdf": {
        "series_slug": "new-glossy-2",
        "collection": "New Glossy 2",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "SUPER HIGH GLOSSY.pdf": {
        "series_slug": "super-high-glossy",
        "collection": "Super High Glossy",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "INKY_1.pdf": {
        "series_slug": "inky-1",
        "collection": "Inky Collection",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Inky",
    },
    "INKY_2.pdf": {
        "series_slug": "inky-2",
        "collection": "Inky Collection 2",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Inky",
    },
    "CARVING.pdf": {
        "series_slug": "carving",
        "collection": "Matt Carving",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Carving",
        "pattern": "Carving",
    },
    "VALENZA NEW CARVING.pdf": {
        "series_slug": "valenza-new-carving",
        "collection": "Carving Collection",
        "category": "gvt-pgvt",
        "subcategory": "600x1200",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Carving",
        "pattern": "Carving",
        "mode": "sequential",
        "start_page": 5,
    },
}

SKIP_NAME_TOKENS = {
    "VALENZA",
    "TILES",
    "TILESIBATHWARE",
    "TILES|BATHWARE",
    "BATHWARE",
    "ENDLESS",
    "FINISH",
    "THE",
    "COLLECTION",
    "GLOSSY",
    "MATT",
    "WOOD",
    "INKY",
    "CARVING",
}


@dataclass
class ExtractedProduct:
    name: str
    series_slug: str
    product_slug: str
    page: int
    image_path: str
    config: dict


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").strip().lower()).strip("-")


def clean_ocr_name(text: str) -> str:
    text = text.replace("|", " ")
    text = re.sub(r"[^A-Za-z0-9&'./+\- ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip().upper()
    return normalize_spaced_letters(text)


def normalize_spaced_letters(text: str) -> str:
    """Merge OCR output like 'E M A S P E N' into 'EMASPEN'."""
    parts = text.split()
    if not parts:
        return text

    merged: list[str] = []
    buf = ""
    for part in parts:
        if len(part) == 1 and part.isalpha():
            buf += part
            continue
        if buf:
            merged.append(buf)
            buf = ""
        merged.append(part)
    if buf:
        merged.append(buf)
    return " ".join(merged)


class CatalogExtractor:
    def __init__(self, scale: float = 2.0, label_height: float = 40.0):
        self.scale = scale
        self.label_height = label_height
        self.ocr = RapidOCR()
        self.used_slugs: set[str] = set()

    def ocr_array(self, arr: np.ndarray) -> list[str]:
        result, _ = self.ocr(arr)
        return [line[1] for line in (result or [])]

    def ocr_label_crop(self, page_img: Image.Image, rect: fitz.Rect) -> str:
        x0 = int(rect.x0 * self.scale)
        y0 = int(rect.y1 * self.scale)
        x1 = int(rect.x1 * self.scale)
        y1 = min(int((rect.y1 + self.label_height) * self.scale), page_img.height)
        if y1 <= y0 or x1 <= x0:
            return ""
        crop = np.array(page_img.crop((x0, y0, x1, y1)))
        lines = self.ocr_array(crop)
        return clean_ocr_name(" ".join(lines))

    def render_page(self, page: fitz.Page) -> Image.Image:
        pix = page.get_pixmap(matrix=fitz.Matrix(self.scale, self.scale))
        return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    def save_page_image(self, doc: fitz.Document, page_num: int, dest: Path) -> bool:
        page = doc[page_num]
        imgs = page.get_images(full=True)
        if not imgs:
            return False
        xref = imgs[0][0]
        extracted = doc.extract_image(xref)
        raw = extracted["image"]
        try:
            with Image.open(BytesIO(raw)) as img:
                img = img.convert("RGB")
                img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                dest.parent.mkdir(parents=True, exist_ok=True)
                img.save(dest, format="WEBP", quality=85, method=6)
            return True
        except Exception:
            return False

    def unique_product_slug(self, name: str, series_slug: str) -> str:
        base = slugify(name) or "product"
        candidate = base
        if candidate in self.used_slugs:
            candidate = f"{series_slug}-{base}"
        idx = 2
        while candidate in self.used_slugs:
            candidate = f"{series_slug}-{base}-{idx}"
            idx += 1
        self.used_slugs.add(candidate)
        return candidate

    def find_index_pages(self, doc: fitz.Document) -> list[int]:
        pages = []
        for i in range(doc.page_count):
            links = [
                l
                for l in doc[i].get_links()
                if l.get("kind") == 4 and l.get("page") is not None
            ]
            if len(links) >= 8:
                pages.append(i)
        return pages

    def extract_indexed_pdf(self, pdf_path: Path, config: dict) -> list[ExtractedProduct]:
        doc = fitz.open(pdf_path)
        series_slug = config["series_slug"]
        index_pages = self.find_index_pages(doc)
        if not index_pages:
            doc.close()
            return []

        products: list[ExtractedProduct] = []
        seen_pages: set[int] = set()

        for index_page_num in index_pages:
            page = doc[index_page_num]
            page_img = self.render_page(page)
            links = [
                l
                for l in page.get_links()
                if l.get("kind") == 4 and l.get("page") is not None
            ]
            for link in links:
                target_page = int(link["page"])
                if target_page in seen_pages:
                    continue
                seen_pages.add(target_page)

                name = self.ocr_label_crop(page_img, link["from"])
                if not name or len(name) < 3:
                    name = f"Product Page {target_page + 1}"

                product_slug = self.unique_product_slug(name, series_slug)
                rel_path = f"/products/vk-pdf/{series_slug}/{product_slug}.webp"
                abs_path = ROOT / "public" / rel_path.lstrip("/")

                if not self.save_page_image(doc, target_page, abs_path):
                    print(f"  warn: no image for {pdf_path.name} page {target_page}", file=sys.stderr)
                    continue

                products.append(
                    ExtractedProduct(
                        name=name,
                        series_slug=series_slug,
                        product_slug=product_slug,
                        page=target_page,
                        image_path=rel_path,
                        config=config,
                    )
                )

        doc.close()
        return products

    def extract_name_from_full_page(self, page_img: Image.Image) -> str | None:
        arr = np.array(page_img)
        lines = [clean_ocr_name(x) for x in self.ocr_array(arr)]
        candidates = []
        for line in lines:
            if len(line) < 4:
                continue
            if any(tok in line for tok in SKIP_NAME_TOKENS):
                # keep if line looks like a product code e.g. EM ASPEN BEIGE
                words = [w for w in line.split() if w not in SKIP_NAME_TOKENS]
                if len(words) >= 2:
                    candidates.append(" ".join(words))
                continue
            if re.search(r"[A-Z]{2,}", line):
                candidates.append(line)
        if not candidates:
            return None
        # prefer longer uppercase names
        candidates.sort(key=len, reverse=True)
        return candidates[0]

    def extract_sequential_pdf(self, pdf_path: Path, config: dict) -> list[ExtractedProduct]:
        doc = fitz.open(pdf_path)
        series_slug = config["series_slug"]
        start = int(config.get("start_page", 5))
        products: list[ExtractedProduct] = []

        for page_num in range(start, doc.page_count):
            page = doc[page_num]
            page_img = self.render_page(page)
            name = self.extract_name_from_full_page(page_img)
            if not name:
                continue

            product_slug = self.unique_product_slug(name, series_slug)
            rel_path = f"/products/vk-pdf/{series_slug}/{product_slug}.webp"
            abs_path = ROOT / "public" / rel_path.lstrip("/")

            if not self.save_page_image(doc, page_num, abs_path):
                continue

            products.append(
                ExtractedProduct(
                    name=name,
                    series_slug=series_slug,
                    product_slug=product_slug,
                    page=page_num,
                    image_path=rel_path,
                    config=config,
                )
            )

        doc.close()
        return products

    def extract_pdf(self, pdf_path: Path) -> list[ExtractedProduct]:
        config = PDF_CONFIGS.get(pdf_path.name)
        if not config:
            print(f"skip: no config for {pdf_path.name}", file=sys.stderr)
            return []

        print(f"extracting {pdf_path.name}...")
        if config.get("mode") == "sequential":
            items = self.extract_sequential_pdf(pdf_path, config)
        else:
            items = self.extract_indexed_pdf(pdf_path, config)
        print(f"  -> {len(items)} products")
        return items


def build_product_record(item: ExtractedProduct, featured: bool) -> dict:
    cfg = item.config
    size = cfg["size"]
    finish = cfg["finish"]
    packing_row = {"size": size.replace(" MM", "").replace("x", "x"), **PACKING.get(size, PACKING["600x1200 MM"])}
    packing = [packing_row]
    thickness = packing_row["thickness"]
    description = (
        f"{item.name} — premium {cfg['collection']} tile from VK Tiles & Granites in "
        f"{size} with {finish.lower()} finish. Extracted from local catalog PDF."
    )

    return {
        "slug": item.product_slug,
        "name": item.name,
        "brand": "VK Tiles & Granites",
        "category": cfg["category"],
        "subcategory": cfg["subcategory"],
        "collection": cfg["collection"],
        "collectionSlug": slugify(cfg["collection"]),
        "series": item.series_slug,
        "description": description,
        "size": size,
        "sizes": [size],
        "finish": finish,
        "finishes": [finish],
        "surface": cfg["surface"],
        "pattern": cfg["pattern"],
        "thickness": thickness,
        "thicknesses": [thickness],
        "packing": packing,
        "features": FEATURES,
        "applications": APPLICATIONS.get(cfg["category"], ["Interior"]),
        "image": item.image_path,
        "images": [item.image_path],
        "imageThumb": item.image_path,
        "imageMedium": item.image_path,
        "availability": "In Stock",
        "featured": featured,
        "sourcePdf": item.series_slug,
        "sourcePage": item.page + 1,
        "downloads": {
            "catalog": f"/VKPdf/{cfg['series_slug']}.pdf",
            "specification": "local",
        },
        "seo": {
            "title": f"{item.name} | {size} {finish} | VK Tiles",
            "description": (
                f"Buy {item.name} {size} {finish} tile from VK Tiles & Granites. "
                f"{packing_row['tilesPerBox']} tiles/box, {packing_row['coverage']} coverage."
            ),
            "keywords": [item.name, size, finish, cfg["collection"], "VK Tiles", "GVT", "PGVT", "tiles"],
        },
    }


def build_categories(products: list[dict]) -> list[dict]:
    categories = {}
    for p in products:
        key = f"{p['category']}::{p['subcategory']}::{p['collection']}"
        if key not in categories:
            categories[key] = {
                "slug": p["subcategory"],
                "name": p["collection"],
                "category": p["category"],
                "subcategory": p["subcategory"],
                "parent": p["category"],
                "blurb": f"VK {p['collection']} — {p['size']}",
                "image": p["image"],
                "count": 0,
            }
        categories[key]["count"] += 1
    return sorted(categories.values(), key=lambda c: (c["category"], c["name"]))


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract VK Tiles catalog from local PDFs")
    parser.add_argument("--pdf", action="append", help="Process only specific PDF filename(s)")
    parser.add_argument("--dry-run", action="store_true", help="Parse names only, skip image writes")
    args = parser.parse_args()

    if args.dry_run:
        print("dry-run mode: image saving disabled is not implemented; use --pdf for a subset")
        return 1

    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    if args.pdf:
        wanted = set(args.pdf)
        pdfs = [p for p in pdfs if p.name in wanted]

    if not pdfs:
        print("No PDFs found", file=sys.stderr)
        return 1

    extractor = CatalogExtractor()
    all_items: list[ExtractedProduct] = []

    for pdf_path in pdfs:
        all_items.extend(extractor.extract_pdf(pdf_path))

    products = []
    for idx, item in enumerate(all_items):
        products.append(build_product_record(item, featured=idx < 12))

    catalog = {
        "scrapedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "count": len(products),
        "brand": "VK Tiles & Granites",
        "source": "VKPdf local extraction",
        "categories": build_categories(products),
        "products": products,
        "errors": [],
    }

    CATALOG_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nWrote {len(products)} products -> {CATALOG_PATH}")
    print(f"Images -> {OUT_IMG_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
