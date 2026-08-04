"""PDF file hash cache for skipping unchanged catalogs."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .utils import file_sha256


def load_cache(path: Path) -> dict:
    if not path.exists():
        return {"files": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"files": {}}


def save_cache(path: Path, cache: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cache, indent=2) + "\n", encoding="utf-8")


def should_skip_pdf(pdf_path: Path, cache: dict, force: bool = False) -> bool:
    if force:
        return False
    rel = pdf_path.name
    entry = cache.get("files", {}).get(rel)
    if not entry:
        return False
    try:
        return entry.get("sha256") == file_sha256(pdf_path)
    except Exception:
        return False


def update_cache_entry(cache: dict, pdf_path: Path, product_count: int) -> None:
    rel = pdf_path.name
    cache.setdefault("files", {})[rel] = {
        "sha256": file_sha256(pdf_path),
        "processedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "productCount": product_count,
    }
