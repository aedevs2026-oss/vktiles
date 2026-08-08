"""Orchestrate PDF extraction, dedup, and catalog merge."""
from __future__ import annotations

import json
import re
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import fitz

from .cache import load_cache, save_cache, should_skip_pdf, update_cache_entry
from .constants import BRAND, LEGACY_PDF_CONFIGS
from .extractors.fullpage import extract_fullpage_pdf
from .extractors.grid import extract_grid_pdf
from .extractors.indexed import IndexedExtractor
from .meta import infer_pdf_meta, resolve_pdf_dirs
from .product_builder import raw_to_product
from .utils import norm_name, slugify


def _log_ok(message: str) -> None:
    """Print status line; ASCII fallback for Windows consoles."""
    try:
        print(f"✓ {message}", flush=True)
    except UnicodeEncodeError:
        print(f"[OK] {message}", flush=True)


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
    """Skip OCR for image-only catalogs that use generated product names."""
    upper = pdf_path.stem.upper()
    if mode == "fullpage":
        if "ELEVATION" in upper or "POSTER" in upper:
            return False
        if re.search(r"\d\s*[x×]\s*\d", upper):
            return False
    return mode in ("indexed", "sequential", "fullpage")


def extract_single_pdf(pdf_path: Path, root: Path, ocr=None) -> tuple[list[dict], int]:
    """Extract products from one PDF. Returns (products, image_count)."""
    meta = infer_pdf_meta(pdf_path, root=root)
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
        mode = detect_pdf_mode(pdf_path)
        ocr = None
        if needs_ocr(pdf_path, mode):
            from rapidocr_onnxruntime import RapidOCR

            ocr = RapidOCR()
        products, images = extract_single_pdf(pdf_path, root, ocr=ocr)
        return str(pdf_path), products, images, None
    except Exception as exc:
        return str(pdf_path), [], 0, str(exc)


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
                "blurb": f"{BRAND} — {p['collection']} ({p['size']})",
                "image": p["image"],
                "count": 0,
            }
        categories[key]["count"] += 1
    return sorted(categories.values(), key=lambda c: (c["category"], c["name"]))


def collect_pdfs(
    root: Path,
    pdf_filter: set[str] | None,
    pdf_dir: Path | None = None,
) -> list[Path]:
    """Gather PDFs from configured source directories (or a single --dir override)."""
    pdfs: list[Path] = []
    seen: set[str] = set()
    search_dirs = [pdf_dir] if pdf_dir else resolve_pdf_dirs(root)
    for search_dir in search_dirs:
        if not search_dir.is_dir():
            continue
        for pdf in sorted(search_dir.rglob("*.pdf")):
            key = str(pdf.resolve()).lower()
            if key in seen:
                continue
            if pdf_filter and pdf.name not in pdf_filter:
                continue
            seen.add(key)
            pdfs.append(pdf)
    return sorted(pdfs, key=lambda p: str(p).lower())


def run_pipeline(
    root: Path,
    catalog_path: Path,
    cache_path: Path,
    workers: int = 2,
    force: bool = False,
    pdf_filter: set[str] | None = None,
    pdf_dir: Path | None = None,
) -> ExtractionStats:
    stats = ExtractionStats()
    pdf_dirs = [pdf_dir] if pdf_dir else resolve_pdf_dirs(root)
    pdfs = collect_pdfs(root, pdf_filter, pdf_dir=pdf_dir)

    if not pdfs:
        dirs_label = ", ".join(str(d) for d in pdf_dirs)
        print(f"No PDFs found in: {dirs_label}", file=sys.stderr)
        return stats

    cache = load_cache(cache_path)
    to_process: list[Path] = []
    for pdf in pdfs:
        if should_skip_pdf(pdf, cache, root, force=force):
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
                path_key, products, images, err = fut.result()
                if err:
                    stats.pdfs_failed += 1
                    stats.failed_pdfs.append(pdf.name)
                    print(f"[fail] {pdf.name}: {err}", file=sys.stderr)
                    continue
                stats.pdfs_processed += 1
                stats.products_extracted += len(products)
                stats.images_extracted += images
                all_new.extend(products)
                update_cache_entry(cache, pdf, root, len(products))
                _log_ok(f"PDF processed: {pdf.name} ({len(products)} products, {images} images)")
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
                update_cache_entry(cache, pdf, root, len(products))
                _log_ok(f"PDF processed: {pdf.name} ({len(products)} products, {images} images)")
            except Exception as exc:
                stats.pdfs_failed += 1
                stats.failed_pdfs.append(pdf.name)
                print(f"[fail] {pdf.name}: {exc}", file=sys.stderr)

    merged = merge_products(existing_products, all_new, stats)

    catalog = {
        "scrapedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "count": len(merged),
        "brand": BRAND,
        "source": "VK local PDF extraction (Vkpdf + public/VKNew)",
        "pdfSource": [str(d.relative_to(root)).replace("\\", "/") for d in pdf_dirs],
        "categories": build_categories(merged),
        "products": merged,
        "errors": stats.failed_pdfs,
    }

    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    save_cache(cache_path, cache)

    return stats
