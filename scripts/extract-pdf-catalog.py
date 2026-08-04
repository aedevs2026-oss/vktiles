#!/usr/bin/env python3
"""
Extract product catalog from Vkpdf folder PDFs.

Scans PDFs recursively, extracts products + tile images, merges into
content/vk-catalog.json, and supports incremental runs via file hashing.

Usage:
  python scripts/extract-pdf-catalog.py
  python scripts/extract-pdf-catalog.py --force
  python scripts/extract-pdf-catalog.py --workers 4
  python scripts/extract-pdf-catalog.py --pdf "ALBERT-BOSTON ( 16x16 ).pdf"
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "content" / "vk-catalog.json"
CACHE_PATH = ROOT / "content" / "pdf-extract-cache.json"

# Allow running as script without package install
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pdf_extract.pipeline import run_pipeline  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract VK Tiles catalog from local PDFs")
    parser.add_argument("--pdf", action="append", help="Process only specific PDF filename(s)")
    parser.add_argument("--force", action="store_true", help="Reprocess all PDFs ignoring hash cache")
    parser.add_argument("--workers", type=int, default=2, help="Parallel PDF workers (default: 2)")
    args = parser.parse_args()

    pdf_filter = set(args.pdf) if args.pdf else None

    print(f"Scanning PDFs in {ROOT / 'Vkpdf'} ...")
    stats = run_pipeline(
        root=ROOT,
        catalog_path=CATALOG_PATH,
        cache_path=CACHE_PATH,
        workers=max(1, args.workers),
        force=args.force,
        pdf_filter=pdf_filter,
    )

    print()
    print("-- Extraction summary --")
    print(f"[ok] PDFs processed:     {stats.pdfs_processed}")
    print(f"[skip] PDFs skipped:       {stats.pdfs_skipped}")
    print(f"[ok] Products extracted: {stats.products_extracted}")
    print(f"[ok] Images extracted:   {stats.images_extracted}")
    print(f"[skip] Duplicates skipped: {stats.duplicates_skipped}")
    print(f"[fail] Failed PDFs:        {stats.pdfs_failed}")
    if stats.failed_pdfs:
        for name in stats.failed_pdfs:
            print(f"    - {name}")
    print(f"\nCatalog -> {CATALOG_PATH}")
    print(f"Images  -> {ROOT / 'public' / 'products' / 'vk-pdf'}")
    return 0 if stats.pdfs_failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
