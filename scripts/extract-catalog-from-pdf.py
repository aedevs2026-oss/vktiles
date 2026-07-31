"""
Extract product catalog + images from VKPdf interactive PDFs.

Each PDF is a clickable catalog: index pages contain thumbnail links (kind=4)
pointing to detail pages with product photos and specs.

Usage:
  pip install pymupdf pillow
  python scripts/extract-catalog-from-pdf.py
  python scripts/extract-catalog-from-pdf.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "VKPdf"
OUT_IMG_DIR = ROOT / "public" / "products"
CATALOG_PATH = ROOT / "content" / "valenza-catalog.json"

RENDER_SCALE = 2.0
INDEX_MIN_LINKS = 6
LABEL_HEIGHT_PX = 90

SIZE_RE = re.compile(
    r"(\d{2,4})\s*[x×]\s*(\d{2,4})\s*(MM|CM)?",
    re.IGNORECASE,
)
THICKNESS_RE = re.compile(r"(\d+(?:\.\d+)?)\s*MM", re.IGNORECASE)

PACKING_DEFAULTS = {
    "300x450 MM": {"thickness": "7.5 MM", "tilesPerBox": 6, "coverage": "0.81 SQM", "weight": "16 KG"},
    "300x600 MM": {"thickness": "9 MM", "tilesPerBox": 5, "coverage": "0.90 SQM", "weight": "18 KG"},
    "600x600 MM": {"thickness": "9 MM", "tilesPerBox": 4, "coverage": "1.44 SQM", "weight": "28 KG"},
    "600x1200 MM": {"thickness": "9 MM", "tilesPerBox": 2, "coverage": "1.44 SQM", "weight": "30 KG"},
    "800x1600 MM": {"thickness": "9 MM", "tilesPerBox": 2, "coverage": "2.56 SQM", "weight": "42 KG"},
    "1200x1800 MM": {"thickness": "9 MM", "tilesPerBox": 1, "coverage": "2.16 SQM", "weight": "38 KG"},
    "1200x1200 MM": {"thickness": "9 MM", "tilesPerBox": 2, "coverage": "2.88 SQM", "weight": "42 KG"},
    "200x900 MM": {"thickness": "9 MM", "tilesPerBox": 8, "coverage": "1.44 SQM", "weight": "22 KG"},
    "200x1200 MM": {"thickness": "9 MM", "tilesPerBox": 6, "coverage": "1.44 SQM", "weight": "26 KG"},
}

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
    "wall-tiles": ["Bathroom", "Kitchen", "Living Room", "Bedroom"],
    "wooden-strip": ["Living Room", "Bedroom", "Commercial Spaces"],
    "parking-tiles": ["Parking Areas", "Driveways", "Commercial Outdoor"],
    "elevation-tiles": ["Building Facade", "Exterior Walls", "Commercial Elevation"],
}

SKIP_LINE_RE = re.compile(
    r"^(valenza|vk tiles|index|page|finish|size|thickness|packing|series|collection|"
    r"tiles/box|sqm|mm|cm|gvt|pgvt|digital|random|endless|matt|glossy|high|super|"
    r"www\.|http|iso|certified|\d+\s*/\s*\d+)$",
    re.IGNORECASE,
)

PDF_META = {
    "MATT": {
        "category": "gvt-pgvt",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Random",
        "collection": "Matt Series",
    },
    "WOODEN MATT": {
        "category": "wooden-strip",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Wood",
        "collection": "Wooden Matt Series",
    },
    "CARVING": {
        "category": "gvt-pgvt",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Carving",
        "collection": "Carving Series",
    },
    "VALENZA NEW CARVING": {
        "category": "gvt-pgvt",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Carving",
        "collection": "New Carving Series",
    },
    "GLOSSY ENDLESS 1": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
        "collection": "Glossy Endless Series 1",
    },
    "GLOSSY ENDLESS 2": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
        "collection": "Glossy Endless Series 2",
    },
    "GLOSSY RANDOM 1": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
        "collection": "Glossy Random Series 1",
    },
    "GLOSSY RANDOM 2": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
        "collection": "Glossy Random Series 2",
    },
    "GLOSSY STAUARIO & ONYX": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Marble",
        "collection": "Statuario & Onyx Series",
    },
    "HIGH GLOSSY": {
        "category": "gvt-pgvt",
        "finish": "High Gloss",
        "surface": "High Gloss",
        "pattern": "Marble",
        "collection": "High Glossy Series",
    },
    "SUPER HIGH GLOSSY": {
        "category": "gvt-pgvt",
        "finish": "Super High Gloss",
        "surface": "Super High Gloss",
        "pattern": "Marble",
        "collection": "Super High Glossy Series",
    },
    "NEW GLOSSY 2": {
        "category": "gvt-pgvt",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Marble",
        "collection": "New Glossy Series 2",
    },
    "INKY_1": {
        "category": "gvt-pgvt",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Inky",
        "collection": "Inky Series 1",
    },
    "INKY_2": {
        "category": "gvt-pgvt",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Inky",
        "collection": "Inky Series 2",
    },
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").strip().lower()).strip("-")


def normalize_size(raw: str | None) -> str | None:
    if not raw:
        return None
    m = SIZE_RE.search(raw.replace(" ", ""))
    if not m:
        m = SIZE_RE.search(raw)
    if not m:
        return None
    a, b, unit = m.group(1), m.group(2), (m.group(3) or "MM").upper()
    return f"{a}x{b} {unit}"


def subcategory_from_size(size: str | None) -> str:
    if not size:
        return "standard"
    return size.split()[0].lower().replace("×", "x")


def pdf_meta_for(path: Path) -> dict:
    stem = path.stem.upper()
    meta = PDF_META.get(stem, {}).copy()
    meta.setdefault("category", "gvt-pgvt")
    meta.setdefault("finish", "Glossy")
    meta.setdefault("surface", "Polished")
    meta.setdefault("pattern", "Random")
    meta.setdefault("collection", stem.title())
    return meta


def page_to_image(page: fitz.Page, scale: float = RENDER_SCALE) -> Image.Image:
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def crop_link_regions(page_img: Image.Image, link: dict, scale: float) -> tuple[Image.Image, Image.Image]:
    rect = link["from"]
    x0 = int(rect.x0 * scale)
    y0 = int(rect.y0 * scale)
    x1 = int(rect.x1 * scale)
    y1 = int(rect.y1 * scale)
    thumb = page_img.crop((x0, y0, x1, y1))
    label_bottom = min(y1 + LABEL_HEIGHT_PX, page_img.height)
    label = page_img.crop((x0, y1, x1, label_bottom))
    return thumb, label


def parse_name_from_text(text: str, fallback: str) -> str:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    candidates = []
    for line in lines:
        if SIZE_RE.search(line):
            continue
        if THICKNESS_RE.fullmatch(line.strip()):
            continue
        if SKIP_LINE_RE.match(line.strip()):
            continue
        if len(line) < 3:
            continue
        if re.fullmatch(r"[\d\s./-]+", line):
            continue
        candidates.append(line)
    if not candidates:
        return fallback
    # Prefer lines that look like product codes / names (uppercase-heavy)
    candidates.sort(key=lambda s: (sum(c.isupper() for c in s), len(s)), reverse=True)
    return candidates[0].upper()


def parse_size_from_text(text: str) -> str | None:
    for line in text.splitlines():
        size = normalize_size(line)
        if size:
            return size
    return None


def largest_embedded_image(page: fitz.Page, doc: fitz.Document) -> Image.Image | None:
    best = None
    best_area = 0
    for info in page.get_images(full=True):
        xref = info[0]
        try:
            base = doc.extract_image(xref)
            data = base.get("image")
            if not data:
                continue
            img = Image.open(BytesIO(data)).convert("RGB")
            area = img.width * img.height
            if area > best_area:
                best_area = area
                best = img
        except Exception:
            continue
    return best


def detail_product_image(page: fitz.Page, doc: fitz.Document) -> Image.Image:
    embedded = largest_embedded_image(page, doc)
    if embedded and embedded.width >= 300 and embedded.height >= 300:
        return embedded
    rendered = page_to_image(page, scale=1.5)
    w, h = rendered.size
    return rendered.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.58)))


def save_webp(img: Image.Image, dest: Path, max_side: int = 1600) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = img.convert("RGB")
    out.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    out.save(dest, format="WEBP", quality=82, method=6)


def build_packing(size: str | None) -> list[dict]:
    key = size or "600x600 MM"
    defaults = PACKING_DEFAULTS.get(key, PACKING_DEFAULTS["600x600 MM"])
    return [{"size": key, **defaults}]


def build_product(
    name: str,
    meta: dict,
    size: str | None,
    image_path: str,
    pdf_name: str,
    featured: bool,
) -> dict:
    size = size or "600x1200 MM"
    packing = build_packing(size)
    subcategory = subcategory_from_size(size)
    slug = slugify(name)
    finish = meta["finish"]
    collection = meta["collection"]
    category = meta["category"]

    description = (
        f"{name} — premium {collection} tile from VK Tiles & Granites in {size} "
        f"with {finish.lower()} finish. Sourced from local catalog ({pdf_name})."
    )

    return {
        "slug": slug,
        "name": name,
        "brand": "VK Tiles & Granites",
        "category": category,
        "subcategory": subcategory,
        "collection": collection,
        "collectionSlug": slugify(collection),
        "description": description,
        "size": size,
        "sizes": [size],
        "finish": finish,
        "finishes": [finish],
        "surface": meta["surface"],
        "pattern": meta["pattern"],
        "thickness": packing[0]["thickness"],
        "thicknesses": [packing[0]["thickness"]],
        "packing": packing,
        "features": FEATURES,
        "applications": APPLICATIONS.get(category, ["Interior", "Exterior"]),
        "image": image_path,
        "images": [image_path],
        "imageThumb": image_path,
        "imageMedium": image_path,
        "availability": "In Stock",
        "featured": featured,
        "sourcePdf": pdf_name,
        "downloads": {"catalog": "local", "specification": "local"},
        "seo": {
            "title": f"{name} | {size} {finish} | VK Tiles",
            "description": (
                f"Buy {name} {size} {finish} tile from VK Tiles & Granites. "
                f"{packing[0]['tilesPerBox']} tiles/box, {packing[0]['coverage']} coverage."
            ),
            "keywords": [name, size, finish, collection, "VK Tiles", "GVT", "PGVT", "tiles"],
        },
    }


def find_index_pages(doc: fitz.Document) -> list[int]:
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


def extract_from_pdf(pdf_path: Path, dry_run: bool = False) -> list[dict]:
    meta = pdf_meta_for(pdf_path)
    category = meta["category"]
    products: list[dict] = []
    seen_pages: set[int] = set()
    seen_slugs: set[str] = set()

    doc = fitz.open(pdf_path)
    index_pages = find_index_pages(doc)
    print(f"  index pages: {index_pages}")

    for index_page_num in index_pages:
        page = doc[index_page_num]
        page_img = page_to_image(page)
        links = [
            l
            for l in page.get_links()
            if l.get("kind") == fitz.LINK_GOTO and l.get("page") is not None
        ]

        for link_idx, link in enumerate(links):
            target = int(link["page"])
            if target in seen_pages:
                continue
            seen_pages.add(target)
            if target >= doc.page_count:
                continue

            detail = doc[target]
            detail_text = detail.get_text()
            thumb, _label = crop_link_regions(page_img, link, RENDER_SCALE)

            fallback_name = f"{pdf_path.stem} {target + 1}"
            name = parse_name_from_text(detail_text, fallback_name)
            size = parse_size_from_text(detail_text)
            slug = slugify(name)
            if slug in seen_slugs:
                slug = slugify(f"{name}-{pdf_path.stem}")
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            rel_path = f"/products/{category}/{slug}.webp"
            dest = OUT_IMG_DIR / category / f"{slug}.webp"

            if not dry_run:
                try:
                    product_img = detail_product_image(detail, doc)
                except Exception:
                    product_img = thumb
                if product_img.width < 120 or product_img.height < 120:
                    product_img = thumb
                save_webp(product_img, dest)

            products.append(
                build_product(
                    name=name,
                    meta=meta,
                    size=size,
                    image_path=rel_path,
                    pdf_name=pdf_path.name,
                    featured=link_idx < 2 and index_page_num == index_pages[0],
                )
            )

    doc.close()
    return products


def build_categories(products: list[dict]) -> list[dict]:
    groups: dict[str, dict] = {}
    for p in products:
        key = f"{p['category']}::{p['subcategory']}"
        if key not in groups:
            groups[key] = {
                "slug": p["subcategory"],
                "name": p["collection"],
                "category": p["category"],
                "subcategory": p["subcategory"],
                "parent": p["category"],
                "blurb": f"VK {p['collection']} — {p['size']}",
                "image": p["image"],
                "count": 0,
            }
        groups[key]["count"] += 1
    return list(groups.values())


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract VK catalog from VKPdf files")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, do not write images/catalog")
    parser.add_argument("--pdf-dir", type=Path, default=PDF_DIR)
    parser.add_argument("--no-backup", action="store_true", help="Skip catalog backup")
    args = parser.parse_args()

    pdf_files = sorted(args.pdf_dir.glob("*.pdf"))
    if not pdf_files:
        raise SystemExit(f"No PDF files found in {args.pdf_dir}")

    print(f"Found {len(pdf_files)} PDF(s) in {args.pdf_dir}")

    all_products: list[dict] = []
    global_slugs: set[str] = set()

    for pdf_path in pdf_files:
        print(f"\nProcessing {pdf_path.name} ...")
        items = extract_from_pdf(pdf_path, dry_run=args.dry_run)
        for item in items:
            if item["slug"] in global_slugs:
                old_slug = item["slug"]
                item["slug"] = slugify(f"{item['name']}-{pdf_path.stem}")
                item["image"] = item["image"].replace(f"/{old_slug}.webp", f"/{item['slug']}.webp")
                item["images"] = [item["image"]]
                item["imageThumb"] = item["image"]
                item["imageMedium"] = item["image"]
            if item["slug"] in global_slugs:
                continue
            global_slugs.add(item["slug"])
            all_products.append(item)
        print(f"  extracted {len(items)} products")

    categories = build_categories(all_products)
    catalog = {
        "scrapedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "count": len(all_products),
        "brand": "VK Tiles & Granites",
        "source": "VKPdf local extraction",
        "categories": categories,
        "products": all_products,
        "errors": [],
    }

    print(f"\nTotal products: {len(all_products)} across {len(categories)} categories")

    if args.dry_run:
        print("Dry run — no files written.")
        for p in all_products[:10]:
            print(f"  - {p['name']} ({p['size']}) -> {p['image']}")
        if len(all_products) > 10:
            print(f"  ... and {len(all_products) - 10} more")
        return

    if CATALOG_PATH.exists() and not args.no_backup:
        backup = CATALOG_PATH.with_name("valenza-catalog.backup.json")
        shutil.copy2(CATALOG_PATH, backup)
        print(f"Backed up existing catalog to {backup.name}")

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CATALOG_PATH.open("w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"Wrote catalog: {CATALOG_PATH}")
    print(f"Images saved under: {OUT_IMG_DIR}")


if __name__ == "__main__":
    main()
