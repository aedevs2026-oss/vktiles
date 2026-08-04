"""Full-page image PDF extractor (elevation catalogs)."""
from __future__ import annotations

import fitz
import numpy as np
from PIL import Image

from ..images import (
    abs_image_path,
    extract_page_images,
    filter_tile_images,
    load_image_from_xref,
    rel_image_path,
    save_webp,
)
from ..product_builder import RawProduct
from ..utils import clean_ocr_text, slugify


def _ocr_page_name(ocr, page, scale: float = 1.5) -> str | None:
  try:
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    result, _ = ocr(arr)
    lines = [clean_ocr_text(line[1]) for line in (result or [])]
    for line in lines:
      if len(line) >= 4 and any(c.isalpha() for c in line):
        if "OUTLOOK" not in line and "COLLECTION" not in line:
          return line
  except Exception:
    return None
  return None


def extract_fullpage_pdf(
    pdf_path,
    meta: dict,
    root,
    used_slugs: set[str],
    ocr=None,
    skip_repeated_xref: bool = True,
) -> list[RawProduct]:
    doc = fitz.open(pdf_path)
    series_slug = meta["series_slug"]
    collection = meta.get("collection", series_slug)
    products: list[RawProduct] = []
    seen_xrefs: set[int] = set()

    for page_num in range(doc.page_count):
        page = doc[page_num]
        page_images = extract_page_images(page, doc)
        tiles = filter_tile_images(page_images, hero=True)
        if not tiles:
            tiles = filter_tile_images(page_images, hero=False)
        if not tiles:
            continue

        hero = max(tiles, key=lambda t: t.pixel_area)
        if skip_repeated_xref and hero.xref in seen_xrefs:
            continue
        seen_xrefs.add(hero.xref)

        name = None
        if ocr is not None:
            name = _ocr_page_name(ocr, page)
        if not name:
            name = f"{collection} Design {len(products) + 1:02d}"

        base_slug = slugify(name) or f"design-{page_num + 1}"
        product_slug = base_slug
        idx = 2
        while product_slug in used_slugs:
            product_slug = f"{base_slug}-{idx}"
            idx += 1
        used_slugs.add(product_slug)

        img = load_image_from_xref(doc, hero.xref)
        if img is None:
            continue

        rel = rel_image_path(series_slug, product_slug)
        dest = abs_image_path(root, rel)
        if not save_webp(img, dest):
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
