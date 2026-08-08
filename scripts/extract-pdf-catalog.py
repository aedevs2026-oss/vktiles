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

from pdf_extract.meta import resolve_pdf_dirs  # noqa: E402
from pdf_extract.pipeline import run_pipeline  # noqa: E402


def _log_ok(message: str) -> None:
    try:
        print(f"✓ {message}")
    except UnicodeEncodeError:
        print(f"[OK] {message}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract VK Tiles catalog from local PDFs")
    parser.add_argument("--pdf", action="append", help="Process only specific PDF filename(s)")
    parser.add_argument(
        "--dir",
        help="Process PDFs only under this path relative to repo root (e.g. public/VkNew)",
    )
    parser.add_argument("--force", action="store_true", help="Reprocess all PDFs ignoring hash cache")
    parser.add_argument("--workers", type=int, default=2, help="Parallel PDF workers (default: 2)")
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Run clean-vk-catalog.py after extraction",
    )
    args = parser.parse_args()

    pdf_filter = set(args.pdf) if args.pdf else None
    pdf_dir = (ROOT / args.dir).resolve() if args.dir else None
    if pdf_dir and not pdf_dir.is_dir():
        print(f"Directory not found: {pdf_dir}", file=sys.stderr)
        return 1

    dirs = [d.relative_to(ROOT) for d in resolve_pdf_dirs(ROOT)]
    scan_label = str(pdf_dir.relative_to(ROOT)) if pdf_dir else ", ".join(str(d) for d in dirs)
    print(f"Scanning PDFs in {scan_label} ...")
    stats = run_pipeline(
        root=ROOT,
        catalog_path=CATALOG_PATH,
        cache_path=CACHE_PATH,
        workers=max(1, args.workers),
        force=args.force,
        pdf_filter=pdf_filter,
        pdf_dir=pdf_dir,
    )

    print()
    print("-- Extraction summary --")
    _log_ok(f"PDFs processed:     {stats.pdfs_processed}")
    print(f"  PDFs skipped:       {stats.pdfs_skipped}")
    _log_ok(f"Products extracted: {stats.products_extracted}")
    _log_ok(f"Images extracted:   {stats.images_extracted}")
    print(f"  Duplicates skipped: {stats.duplicates_skipped}")
    print(f"  Failed PDFs:        {stats.pdfs_failed}")
    if stats.failed_pdfs:
        for name in stats.failed_pdfs:
            print(f"    - {name}")
    if args.clean:
        import subprocess

        print("\nRunning catalog cleanup...")
        subprocess.run([sys.executable, str(ROOT / "scripts" / "clean-vk-catalog.py")], check=True)

    print(f"\nCatalog -> {CATALOG_PATH}")
    print(f"Images  -> {ROOT / 'public' / 'products' / 'vk-pdf'}")
    return 0 if stats.pdfs_failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
