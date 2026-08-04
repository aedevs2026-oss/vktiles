"""Infer collection, category, and size from PDF filenames."""
from __future__ import annotations

import re
from pathlib import Path

from .constants import LEGACY_PDF_CONFIGS
from .utils import normalize_size, slugify


def resolve_pdf_dir(root: Path) -> Path:
    for name in ("Vkpdf", "VKPdf"):
        candidate = root / name
        if candidate.is_dir():
            return candidate
    return root / "Vkpdf"


def derive_collection_name(stem: str) -> str:
    """Human-readable collection name from PDF stem."""
    text = stem
    text = re.sub(r"\(\s*\d+\s*[x×]\s*\d+\s*\)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\d{3,4}\s*[x×]\s*\d{3,4}\s*MM", "", text, flags=re.IGNORECASE)
    text = text.replace("_", " ").replace("-", " ").strip()
    text = re.sub(r"\s+", " ", text)
    # Title-case words except short tokens
    words = []
    for w in text.split():
        if w.upper() in {"WL", "DK", "MM"}:
            words.append(w.upper())
        else:
            words.append(w.capitalize())
    return " ".join(words) or stem


def infer_pdf_meta(pdf_path: Path) -> dict:
    """Build extraction metadata from filename and legacy overrides."""
    legacy = LEGACY_PDF_CONFIGS.get(pdf_path.name)
    if legacy:
        meta = dict(legacy)
        meta.setdefault("series_slug", slugify(meta.get("collection", pdf_path.stem)))
        meta.setdefault("subcategory", meta.get("size", "600x1200 MM").split()[0].lower())
        meta["pdf_rel_path"] = pdf_path.name
        return meta

    stem = pdf_path.stem
    upper = stem.upper()
    size = None
    category = "wall-tiles"
    finish = "Matt"
    surface = "Matt"
    pattern = "Decorative"

    m = re.search(r"(\d{3,4})\s*[x×]\s*(\d{3,4})\s*MM", upper)
    if m:
        size = f"{m.group(1)}x{m.group(2)} MM"

    if "ELEVATION" in upper:
        category = "elevation-tiles"
        finish = "Matt"
        surface = "High Depth"
        pattern = "Elevation"
    elif re.search(r"16\s*[x×]\s*16", upper):
        size = size or "400x400 MM"
        category = "wall-tiles"
    elif "CARVING" in upper:
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        finish = "Matt"
        surface = "Carving"
        pattern = "Carving"
    elif "GLITTER" in upper:
        category = "wall-tiles"
        size = size or "400x400 MM"
        pattern = "Glitter"
    elif "PARKING" in upper:
        category = "parking-tiles"
        size = size or "400x400 MM"

    if not size:
        size = normalize_size(stem) or "400x400 MM"

    collection = derive_collection_name(stem)
    series_slug = slugify(collection) or slugify(stem)

    return {
        "series_slug": series_slug,
        "collection": collection,
        "category": category,
        "subcategory": size.split()[0].lower(),
        "size": size,
        "finish": finish,
        "surface": surface,
        "pattern": pattern,
        "pdf_rel_path": pdf_path.name,
    }
