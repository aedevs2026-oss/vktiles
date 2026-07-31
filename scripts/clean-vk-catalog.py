"""Clean VK catalog: keep VKPdf products only, enrich specs, remove duplicates."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "content" / "valenza-catalog.json"
OUT = ROOT / "content" / "vk-catalog.json"

BRAND = "VK Tiles & Granites"
MATERIAL = {
    "gvt-pgvt": "Glazed Vitrified Tile (GVT/PGVT)",
    "wooden-strip": "Porcelain Wood-Look Tile",
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").strip().lower()).strip("-")


def is_vkpdf_product(p: dict) -> bool:
    image = p.get("image") or ""
    return image.startswith("/products/vk-pdf/")


def norm_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().upper())


def build_description(p: dict) -> str:
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
    return {
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


def build_seo(p: dict) -> dict:
    size = p.get("size", "")
    finish = p.get("finish", "")
    collection = p.get("collection", "")
    packing = (p.get("packing") or [{}])[0]
    return {
        "title": f"{p['name']} | {size} {finish} | {BRAND}",
        "description": (
            f"Buy {p['name']} {size} {finish} tile from {BRAND}. "
            f"{packing.get('tilesPerBox', 2)} tiles/box, {packing.get('coverage', '1.44 SQM')} coverage."
        ),
        "keywords": [p["name"], size, finish, collection, BRAND, "GVT", "PGVT", "tiles", "Bommidi"],
    }


def main() -> None:
    catalog = json.loads(SRC.read_text(encoding="utf-8"))
    products = [p for p in catalog.get("products", []) if is_vkpdf_product(p)]

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
        p["downloads"] = {
            "catalog": f"/VKPdf/{p.get('series', 'catalog')}.pdf",
            "specification": "/contact",
        }
        if "sourceUrl" in p:
            del p["sourceUrl"]
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
        "source": "VKPdf local catalog",
        "categories": sorted(categories.values(), key=lambda c: (c["category"], c["name"])),
        "products": cleaned,
        "errors": [],
    }

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(cleaned)} VKPdf products -> {OUT}")


if __name__ == "__main__":
    main()
