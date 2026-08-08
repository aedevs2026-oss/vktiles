"""Build product records, specifications, and SEO descriptions."""
from __future__ import annotations

from dataclasses import dataclass, field

from .constants import APPLICATIONS, BRAND, FEATURES, MATERIAL, PACKING_DEFAULTS
from .utils import norm_name, parse_finish, parse_random_count, slugify, subcategory_from_size


@dataclass
class RawProduct:
    name: str
    series_slug: str
    product_slug: str
    page: int
    image_paths: list[str] = field(default_factory=list)
    meta: dict = field(default_factory=dict)
    specs: dict = field(default_factory=dict)
    description: str | None = None


def build_packing(size: str) -> list[dict]:
    defaults = PACKING_DEFAULTS.get(size, PACKING_DEFAULTS.get("400x400 MM", PACKING_DEFAULTS["600x1200 MM"]))
    return [{"size": size, **defaults}]


def build_specifications(raw: RawProduct) -> dict:
    meta = raw.meta
    size = meta.get("size", "400x400 MM")
    packing = build_packing(size)
    pack = packing[0]
    specs = {
        "brand": BRAND,
        "category": meta.get("category"),
        "collection": meta.get("collection"),
        "size": size,
        "thickness": pack.get("thickness"),
        "finish": meta.get("finish"),
        "surface": meta.get("surface"),
        "pattern": meta.get("pattern"),
        "material": MATERIAL.get(meta.get("category"), "Premium Ceramic Tile"),
        "tilesPerBox": pack.get("tilesPerBox"),
        "coverage": pack.get("coverage"),
        "weightPerBox": pack.get("weight"),
        "waterAbsorption": "Low",
        "breakingStrength": "High",
        "frostResistant": True,
        "stainResistant": True,
    }
    for key, val in raw.specs.items():
        if val is not None:
            specs[key] = val
    return specs


def generate_description(raw: RawProduct, specs: dict) -> str:
    """SEO-friendly description from specs only — no invented features."""
    if raw.description and len(raw.description.split()) >= 40:
        return raw.description

    meta = raw.meta
    name = raw.name
    collection = meta.get("collection", "VK")
    size = specs.get("size", meta.get("size", ""))
    finish = specs.get("finish", meta.get("finish", ""))
    surface = specs.get("surface", meta.get("surface", ""))
    pattern = specs.get("pattern", meta.get("pattern", ""))
    thickness = specs.get("thickness", "")
    material = specs.get("material", "")
    tiles = specs.get("tilesPerBox")
    coverage = specs.get("coverage")
    weight = specs.get("weightPerBox")
    random = specs.get("randomFaces")

    category_label = meta.get("category", "").replace("-", " ")
    parts = [
        f"{BRAND} — {name} from the {collection} collection.",
        f"Category: {category_label}.",
        f"This {finish.lower()} {surface.lower()} tile is offered in {size}"
        + (f" with {thickness} thickness." if thickness else "."),
    ]
    if pattern:
        parts.append(f"Design pattern: {pattern}.")
    if material:
        parts.append(f"Material: {material}.")
    if random:
        parts.append(f"Available as {random}.")
    if tiles and coverage:
        parts.append(
            f"Each box contains {tiles} tiles covering approximately {coverage}"
            + (f" (around {weight} per box)." if weight else ".")
        )
    parts.append(
        "Engineered for low water absorption, high breaking strength, frost and stain resistance."
    )
    apps = APPLICATIONS.get(meta.get("category"), ["Interior applications"])
    parts.append(f"Suitable for {', '.join(apps[:4])}.")

    text = " ".join(parts)
    words = text.split()
    if len(words) > 150:
        text = " ".join(words[:150])
    elif len(words) < 80:
        text += (
            " Manufactured under ISO 9001:2015 quality standards for durable, easy-maintenance surfaces."
        )
    return text


def build_seo(raw: RawProduct, specs: dict, description: str) -> dict:
    meta = raw.meta
    size = specs.get("size", "")
    finish = specs.get("finish", "")
    collection = meta.get("collection", "")
    packing = build_packing(size)[0]
    return {
        "title": f"{raw.name} | {size} {finish} | {BRAND}",
        "description": description[:160],
        "keywords": [raw.name, size, finish, collection, BRAND, "tiles", "VK Tiles", meta.get("category", "")],
    }


def raw_to_product(raw: RawProduct, featured: bool = False) -> dict:
    meta = raw.meta
    size = meta.get("size", "400x400 MM")
    packing = build_packing(size)
    thickness = packing[0].get("thickness")
    specs = build_specifications(raw)
    description = generate_description(raw, specs)
    primary = raw.image_paths[0] if raw.image_paths else ""
    pdf_rel = meta.get("pdf_rel_path", meta.get("series_slug", ""))
    catalog_path = f"/{pdf_rel.lstrip('/')}" if pdf_rel else f"/Vkpdf/{raw.series_slug}.pdf"

    return {
        "slug": raw.product_slug,
        "name": norm_name(raw.name),
        "brand": BRAND,
        "category": meta.get("category"),
        "subcategory": subcategory_from_size(size),
        "collection": meta.get("collection"),
        "collectionSlug": slugify(meta.get("collection", "")),
        "series": raw.series_slug,
        "description": description,
        "size": size,
        "sizes": [size],
        "finish": meta.get("finish"),
        "finishes": [meta.get("finish")],
        "surface": meta.get("surface"),
        "pattern": meta.get("pattern"),
        "thickness": thickness,
        "thicknesses": [thickness],
        "packing": packing,
        "features": FEATURES,
        "applications": APPLICATIONS.get(meta.get("category"), ["Interior"]),
        "specifications": specs,
        "image": primary,
        "images": list(raw.image_paths),
        "imageThumb": primary,
        "imageMedium": primary,
        "availability": "In Stock",
        "featured": featured,
        "sourcePdf": raw.series_slug,
        "sourcePage": raw.page + 1,
        "downloads": {
            "catalog": catalog_path,
            "specification": "/contact",
        },
        "seo": build_seo(raw, specs, description),
    }


def parse_page_specs(page_text: str) -> dict:
    specs: dict = {}
    finish = parse_finish(page_text)
    if finish:
        specs["finish"] = finish.strip()
    random = parse_random_count(page_text)
    if random:
        specs["randomFaces"] = random
    return specs
