"""Clean VK catalog: enrich specs, descriptions, dedupe by series+name."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "content" / "vk-catalog.json"
OUT = ROOT / "content" / "vk-catalog.json"

BRAND = "VK Tiles & Granites"
MATERIAL = {
    "gvt-pgvt": "Glazed Vitrified Tile (GVT/PGVT)",
    "wooden-strip": "Porcelain Wood-Look Tile",
    "wall-tiles": "Ceramic Wall Tile",
    "elevation-tiles": "Elevation / High Depth Tile",
    "parking-tiles": "Parking Floor Tile",
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").strip().lower()).strip("-")


def norm_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().upper())


def build_description(p: dict) -> str:
    if p.get("description") and len(p["description"].split()) >= 40:
        return p["description"]
    packing = (p.get("packing") or [{}])[0]
    apps = ", ".join((p.get("applications") or [])[:4])
    material = MATERIAL.get(p.get("category"), "Premium Ceramic Tile")
    return (
        f"{p['name']} from the {p.get('collection', 'VK')} range by {BRAND}. "
        f"This {p.get('finish', '').lower()} {p.get('surface', '').lower()} tile "
        f"comes in {p.get('size', 'standard size')} with {p.get('thickness', '9 MM')} thickness. "
        f"Pattern: {p.get('pattern', '—')}. Material: {material}. "
        f"Each box contains {packing.get('tilesPerBox', '—')} tiles covering "
        f"{packing.get('coverage', '—')} (approx. {packing.get('weight', '—')} per box). "
        f"Suitable for {apps}."
    )


def build_specifications(p: dict) -> dict:
    packing = (p.get("packing") or [{}])[0]
    specs = p.get("specifications") or {}
    base = {
        "size": p.get("size"),
        "thickness": p.get("thickness"),
        "finish": p.get("finish"),
        "surface": p.get("surface"),
        "pattern": p.get("pattern"),
        "material": MATERIAL.get(p.get("category"), "Premium Ceramic Tile"),
        "tilesPerBox": packing.get("tilesPerBox"),
        "coverage": packing.get("coverage"),
        "weightPerBox": packing.get("weight"),
        "waterAbsorption": "Low",
        "breakingStrength": "High",
        "frostResistant": True,
        "stainResistant": True,
    }
    return {**base, **specs}


def build_seo(p: dict) -> dict:
    size = p.get("size", "")
    finish = p.get("finish", "")
    collection = p.get("collection", "")
    packing = (p.get("packing") or [{}])[0]
    desc = (p.get("description") or "")[:160]
    return {
        "title": f"{p['name']} | {size} {finish} | {BRAND}",
        "description": desc or (
            f"Buy {p['name']} {size} {finish} tile from {BRAND}. "
            f"{packing.get('tilesPerBox', 2)} tiles/box, {packing.get('coverage', '1.44 SQM')} coverage."
        ),
        "keywords": [p["name"], size, finish, collection, BRAND, "GVT", "PGVT", "tiles", "Bommidi"],
    }


def main() -> None:
    catalog = json.loads(SRC.read_text(encoding="utf-8"))
    products = catalog.get("products", [])

    seen = set()
    cleaned = []
    for p in products:
        key = (p.get("series", ""), norm_name(p.get("name", "")))
        if key in seen:
            continue
        seen.add(key)

        p["brand"] = BRAND
        p["description"] = build_description(p)
        p["specifications"] = build_specifications(p)
        p["seo"] = build_seo(p)
        p["collectionSlug"] = slugify(p.get("collection", ""))
        catalog_url = (p.get("downloads") or {}).get("catalog", "")
        if catalog_url.startswith("/Vkpdf/"):
            pdf_name = catalog_url.replace("/Vkpdf/", "")
            vk_path = ROOT / "public" / "VKProducts" / pdf_name
            if vk_path.exists():
                p.setdefault("downloads", {})["catalog"] = f"/VKProducts/{pdf_name}"
            elif pdf_name:
                p.setdefault("downloads", {})["catalog"] = f"/VKProducts/{pdf_name}"
        elif not catalog_url and p.get("series"):
            series_pdf = ROOT / "public" / "VKProducts" / f"{p['series']}.pdf"
            if series_pdf.exists():
                p.setdefault("downloads", {})["catalog"] = f"/VKProducts/{series_pdf.name}"
        cleaned.append(p)

    categories = {}
    for p in cleaned:
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

    out = {
        "scrapedAt": catalog.get("scrapedAt"),
        "count": len(cleaned),
        "brand": BRAND,
        "source": "VKProducts local catalog",
        "categories": sorted(categories.values(), key=lambda c: (c["category"], c["name"])),
        "products": cleaned,
        "errors": catalog.get("errors", []),
    }

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(cleaned)} VKProducts products -> {OUT}")


if __name__ == "__main__":
    main()
