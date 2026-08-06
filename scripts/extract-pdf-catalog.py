#!/usr/bin/env python3
"""
Extract product catalog from VKProducts PDFs.

Scans PDFs recursively under public/VKProducts (fallback: Vkpdf/),
extracts products + tile images, merges into content/vk-catalog.json,
and supports incremental runs via file hashing.

Usage:
  python scripts/extract-pdf-catalog.py
  python scripts/extract-pdf-catalog.py --force
  python scripts/extract-pdf-catalog.py --workers 4
  python scripts/extract-pdf-catalog.py --pdf "MATT.pdf"
  python scripts/extract-pdf-catalog.py --import
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

# Windows consoles often default to cp1252 — allow ✓ in log output.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "content" / "vk-catalog.json"
CACHE_PATH = ROOT / "content" / "pdf-extract-cache.json"

# Allow running as script without package install
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pdf_extract.meta import resolve_pdf_dir  # noqa: E402
from pdf_extract.pipeline import run_pipeline  # noqa: E402


def run_supabase_import() -> int:
    """Run the idempotent Supabase catalog import after extraction."""
    script = ROOT / "scripts" / "import-catalog-to-supabase.mjs"
    print("\n-- Importing catalog to Supabase --")
    result = subprocess.run(
        ["node", str(script)],
        cwd=str(ROOT),
        check=False,
    )
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract VK Tiles catalog from local PDFs")
    parser.add_argument("--pdf", action="append", help="Process only specific PDF filename(s)")
    parser.add_argument("--force", action="store_true", help="Reprocess all PDFs ignoring hash cache")
    parser.add_argument("--workers", type=int, default=2, help="Parallel PDF workers (default: 2)")
    parser.add_argument(
        "--import",
        dest="do_import",
        action="store_true",
        help="Import catalog to Supabase after extraction",
    )
    args = parser.parse_args()

    pdf_filter = set(args.pdf) if args.pdf else None
    pdf_dir = resolve_pdf_dir(ROOT)

    print(f"Scanning PDFs in {pdf_dir} ...")
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
    print(f"✓ PDFs processed:     {stats.pdfs_processed}")
    print(f"  PDFs skipped:       {stats.pdfs_skipped}")
    print(f"✓ Products extracted: {stats.products_extracted}")
    print(f"✓ Images extracted:   {stats.images_extracted}")
    print(f"  Duplicates skipped: {stats.duplicates_skipped}")
    print(f"✗ Failed PDFs:        {stats.pdfs_failed}")
    if stats.failed_pdfs:
        for name in stats.failed_pdfs:
            print(f"    - {name}")
    print(f"\nCatalog -> {CATALOG_PATH}")
    print(f"Images  -> {ROOT / 'public' / 'products' / 'vk-pdf'}")

    exit_code = 0 if stats.pdfs_failed == 0 else 1

    if args.do_import:
        import_code = run_supabase_import()
        exit_code = max(exit_code, import_code)

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
