"""Orchestrate PDF extraction, dedup, and catalog merge."""
from __future__ import annotations

import json
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import fitz

from .cache import load_cache, save_cache, should_skip_pdf, update_cache_entry
from .constants import LEGACY_PDF_CONFIGS
from .extractors.fullpage import extract_fullpage_pdf
from .extractors.grid import extract_grid_pdf
from .extractors.indexed import IndexedExtractor
from .meta import infer_pdf_meta, resolve_pdf_dir
from .product_builder import raw_to_product
from .utils import norm_name, slugify


@dataclass
class ExtractionStats:
    pdfs_processed: int = 0
    pdfs_skipped: int = 0
    pdfs_failed: int = 0
    products_extracted: int = 0
    images_extracted: int = 0
    duplicates_skipped: int = 0
    failed_pdfs: list[str] = field(default_factory=list)


def detect_pdf_mode(pdf_path: Path) -> str:
    """Return extraction mode: indexed, sequential, grid, or fullpage."""
    if pdf_path.name in LEGACY_PDF_CONFIGS:
        cfg = LEGACY_PDF_CONFIGS[pdf_path.name]
        if cfg.get("mode") == "sequential":
            return "sequential"
        return "indexed"

    doc = fitz.open(pdf_path)
    index_links = 0
    grid_name_pages = 0
    fullpage_pages = 0

    for i in range(doc.page_count):
        page = doc[i]
        links = [l for l in page.get_links() if l.get("kind") == fitz.LINK_GOTO and l.get("page") is not None]
        if len(links) >= 6:
            index_links += 1

        text = page.get_text()
        from .utils import is_product_code

        names = [ln.strip() for ln in text.splitlines() if is_product_code(ln.strip())]
        if len(names) >= 1:
            grid_name_pages += 1

        imgs = page.get_images(full=True)
        if imgs and not text.strip():
            fullpage_pages += 1

    doc.close()

    if index_links > 0:
        return "indexed"
    if grid_name_pages >= 2:
        return "grid"
    return "fullpage"


def needs_ocr(pdf_path: Path, mode: str) -> bool:
    """Elevation image-only catalogs use generated names — skip slow OCR."""
    if mode == "fullpage" and "ELEVATION" in pdf_path.stem.upper():
        return False
    return mode in ("indexed", "sequential", "fullpage")


def extract_single_pdf(pdf_path: Path, root: Path, ocr=None) -> tuple[list[dict], int]:
    """Extract products from one PDF. Returns (products, image_count)."""
    meta = infer_pdf_meta(pdf_path)
    mode = detect_pdf_mode(pdf_path)
    used_slugs: set[str] = set()
    raw_products = []

    if mode == "indexed":
        extractor = IndexedExtractor(ocr=ocr)
        raw_products = extractor.extract_indexed(pdf_path, meta, root, used_slugs)
    elif mode == "sequential":
        extractor = IndexedExtractor(ocr=ocr)
        raw_products = extractor.extract_sequential(pdf_path, meta, root, used_slugs)
    elif mode == "grid":
        raw_products = extract_grid_pdf(pdf_path, meta, root, used_slugs)
    else:
        raw_products = extract_fullpage_pdf(pdf_path, meta, root, used_slugs, ocr=ocr)

    image_count = sum(len(r.image_paths) for r in raw_products)
    products = [raw_to_product(r, featured=False) for r in raw_products]
    return products, image_count


def _worker_extract(args: tuple) -> tuple[str, list[dict], int, str | None]:
    pdf_path_str, root_str = args
    pdf_path = Path(pdf_path_str)
    root = Path(root_str)
    try:
        # Lazy OCR load only when needed
        mode = detect_pdf_mode(pdf_path)
        ocr = None
        if needs_ocr(pdf_path, mode):
            from rapidocr_onnxruntime import RapidOCR

            ocr = RapidOCR()
        products, images = extract_single_pdf(pdf_path, root, ocr=ocr)
        return pdf_path.name, products, images, None
    except Exception as exc:
        return pdf_path.name, [], 0, str(exc)


def merge_products(existing: list[dict], new_items: list[dict], stats: ExtractionStats) -> list[dict]:
    by_slug: dict[str, dict] = {p["slug"]: p for p in existing}
    seen_name_keys: set[tuple[str, str]] = set()

    for p in existing:
        seen_name_keys.add((p.get("series", ""), norm_name(p.get("name", ""))))

    for p in new_items:
        name_key = (p.get("series", ""), norm_name(p.get("name", "")))
        if name_key in seen_name_keys and p["slug"] not in by_slug:
            stats.duplicates_skipped += 1
            continue
        seen_name_keys.add(name_key)

        if p["slug"] in by_slug:
            old = by_slug[p["slug"]]
            merged = {**old, **p}
            # Preserve existing image if new extraction has none
            if not p.get("image") and old.get("image"):
                merged["image"] = old["image"]
                merged["images"] = old.get("images", [])
            by_slug[p["slug"]] = merged
        else:
            by_slug[p["slug"]] = p

    return list(by_slug.values())


def build_categories(products: list[dict]) -> list[dict]:
    categories: dict[str, dict] = {}
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


def run_pipeline(
    root: Path,
    catalog_path: Path,
    cache_path: Path,
    workers: int = 2,
    force: bool = False,
    pdf_filter: set[str] | None = None,
) -> ExtractionStats:
    stats = ExtractionStats()
    pdf_dir = resolve_pdf_dir(root)
    pdfs = sorted(pdf_dir.rglob("*.pdf"))
    if pdf_filter:
        pdfs = [p for p in pdfs if p.name in pdf_filter]

    if not pdfs:
        print(f"No PDFs found in {pdf_dir}", file=sys.stderr)
        return stats

    cache = load_cache(cache_path)
    to_process: list[Path] = []
    for pdf in pdfs:
        if should_skip_pdf(pdf, cache, force=force):
            stats.pdfs_skipped += 1
            print(f"[skip] unchanged: {pdf.name}")
        else:
            to_process.append(pdf)

    existing_products: list[dict] = []
    if catalog_path.exists():
        try:
            catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
            existing_products = catalog.get("products", [])
        except Exception:
            pass

    all_new: list[dict] = []

    if workers > 1 and len(to_process) > 1:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(_worker_extract, (str(p), str(root))): p for p in to_process
            }
            for fut in as_completed(futures):
                pdf = futures[fut]
                name, products, images, err = fut.result()
                if err:
                    stats.pdfs_failed += 1
                    stats.failed_pdfs.append(name)
                    print(f"[fail] {name}: {err}", file=sys.stderr)
                    continue
                stats.pdfs_processed += 1
                stats.products_extracted += len(products)
                stats.images_extracted += images
                all_new.extend(products)
                update_cache_entry(cache, pdf, len(products))
                print(f"[ok] PDF processed: {name} ({len(products)} products, {images} images)")
    else:
        ocr = None
        try:
            from rapidocr_onnxruntime import RapidOCR

            ocr = RapidOCR()
        except Exception:
            ocr = None

        for pdf in to_process:
            try:
                mode = detect_pdf_mode(pdf)
                local_ocr = ocr if needs_ocr(pdf, mode) else None
                products, images = extract_single_pdf(pdf, root, ocr=local_ocr)
                stats.pdfs_processed += 1
                stats.products_extracted += len(products)
                stats.images_extracted += images
                all_new.extend(products)
                update_cache_entry(cache, pdf, len(products))
                print(f"[ok] PDF processed: {pdf.name} ({len(products)} products, {images} images)")
            except Exception as exc:
                stats.pdfs_failed += 1
                stats.failed_pdfs.append(pdf.name)
                print(f"[fail] {pdf.name}: {exc}", file=sys.stderr)

    merged = merge_products(existing_products, all_new, stats)

    catalog = {
        "scrapedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "count": len(merged),
        "brand": "VK Tiles & Granites",
        "source": "VKPdf local extraction",
        "categories": build_categories(merged),
        "products": merged,
        "errors": stats.failed_pdfs,
    }

    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    save_cache(cache_path, cache)

    return stats
