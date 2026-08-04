"""Grid-layout PDF extractor (multi-product catalog pages)."""
from __future__ import annotations

import fitz

from ..images import (
    abs_image_path,
    extract_page_images,
    filter_tile_images,
    load_image_from_xref,
    match_name_to_hero,
    rel_image_path,
    save_webp,
)
from ..product_builder import RawProduct, parse_page_specs
from ..utils import is_product_code, norm_name, slugify


def _page_product_names(page) -> list[tuple[str, tuple]]:
    names: list[tuple[str, tuple]] = []
    seen: set[str] = set()
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"]).strip()
            if not is_product_code(text):
                continue
            name = norm_name(text)
            if name in seen:
                continue
            seen.add(name)
            names.append((name, tuple(line["bbox"])))
    return names


def extract_grid_pdf(pdf_path, meta: dict, root, used_slugs: set[str]) -> list[RawProduct]:
    doc = fitz.open(pdf_path)
    series_slug = meta["series_slug"]
    products: list[RawProduct] = []
    seen_keys: set[tuple[str, str]] = set()

    for page_num in range(doc.page_count):
        page = doc[page_num]
        names = _page_product_names(page)
        if not names:
            continue

        page_images = extract_page_images(page, doc)
        tiles = filter_tile_images(page_images, hero=False)
        if not tiles:
            tiles = filter_tile_images(page_images, hero=True)
        if not tiles:
            continue

        page_text = page.get_text()
        page_specs = parse_page_specs(page_text)
        pairs = match_name_to_hero(names, tiles)

        for name, hero in pairs:
            key = (series_slug, norm_name(name))
            if key in seen_keys:
                continue
            if hero is None:
                continue
            seen_keys.add(key)

            base_slug = slugify(name) or slugify(f"{name}-{page_num}")
            product_slug = base_slug
            idx = 2
            while product_slug in used_slugs:
                product_slug = f"{base_slug}-{idx}"
                idx += 1
            used_slugs.add(product_slug)

            image_paths: list[str] = []
            img = load_image_from_xref(doc, hero.xref)
            if img is None:
                continue

            rel = rel_image_path(series_slug, product_slug)
            dest = abs_image_path(root, rel)
            if save_webp(img, dest):
                image_paths.append(rel)

            # Additional variant tiles in the same column as the hero
            hero_cx = (hero.rect[0] + hero.rect[2]) / 2
            col_variants = [
                v
                for v in filter_tile_images(page_images, hero=False)
                if abs((v.rect[0] + v.rect[2]) / 2 - hero_cx) < 200
                and v.xref != hero.xref
            ]
            for vi, variant in enumerate(col_variants[:3]):
                vimg = load_image_from_xref(doc, variant.xref)
                if vimg is None:
                    continue
                vrel = rel_image_path(series_slug, product_slug, vi + 1)
                vdest = abs_image_path(root, vrel)
                if save_webp(vimg, vdest):
                    image_paths.append(vrel)

            local_meta = dict(meta)
            if page_specs.get("finish"):
                local_meta["finish"] = page_specs["finish"]

            products.append(
                RawProduct(
                    name=name,
                    series_slug=series_slug,
                    product_slug=product_slug,
                    page=page_num,
                    image_paths=image_paths,
                    meta=local_meta,
                    specs=page_specs,
                )
            )

    doc.close()
    return products
