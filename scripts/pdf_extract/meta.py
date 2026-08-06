"""Infer collection, category, and size from PDF filenames."""
from __future__ import annotations

import re
from pathlib import Path

from .constants import LEGACY_PDF_CONFIGS
from .utils import normalize_size, slugify

# Preferred PDF source folders (first match wins).
PDF_DIR_CANDIDATES = (
    "public/VKProducts",
    "VKProducts",
    "Vkpdf",
    "VKPdf",
)


def resolve_pdf_dir(root: Path) -> Path:
    """Return the directory containing source PDF catalogs."""
    for rel in PDF_DIR_CANDIDATES:
        candidate = root / rel
        if candidate.is_dir():
            return candidate
    return root / "public" / "VKProducts"


def pdf_public_url(pdf_path: Path, root: Path) -> str:
    """Browser path for a PDF under public/ (e.g. /VKProducts/MATT.pdf)."""
    public = (root / "public").resolve()
    try:
        rel = pdf_path.resolve().relative_to(public)
        return "/" + rel.as_posix()
    except ValueError:
        return f"/VKProducts/{pdf_path.name}"


def pdf_cache_key(pdf_path: Path, pdf_dir: Path) -> str:
    """Stable cache key — relative path within the PDF scan root."""
    try:
        return pdf_path.resolve().relative_to(pdf_dir.resolve()).as_posix()
    except ValueError:
        return pdf_path.name


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


def infer_pdf_meta(pdf_path: Path, root: Path | None = None) -> dict:
    """Build extraction metadata from filename and legacy overrides."""
    legacy = LEGACY_PDF_CONFIGS.get(pdf_path.name)
    if legacy:
        meta = dict(legacy)
        meta.setdefault("series_slug", slugify(meta.get("collection", pdf_path.stem)))
        meta.setdefault("subcategory", meta.get("size", "600x1200 MM").split()[0].lower())
        meta["pdf_rel_path"] = pdf_path.name
        if root is not None:
            meta["pdf_catalog_url"] = pdf_public_url(pdf_path, root)
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

    if re.search(r"ELE[-_]?\d", upper) or "ELEVATION" in upper:
        category = "elevation-tiles"
        finish = "Matt"
        surface = "High Depth"
        pattern = "Elevation"
    elif "EXTERIA" in upper or "EXTERIOR" in upper:
        category = "elevation-tiles"
        finish = "Matt"
        surface = "High Depth"
        pattern = "Exterior"
    elif "KITCHEN" in upper:
        category = "wall-tiles"
        size = size or "300x450 MM"
        pattern = "Kitchen"
    elif "POOJA" in upper:
        category = "wall-tiles"
        size = size or "300x450 MM"
        pattern = "Pooja"
    elif "INTERIOR" in upper:
        category = "wall-tiles"
        size = size or "300x600 MM"
        pattern = "Interior"
    elif re.search(r"16\s*[x×]\s*16", upper):
        size = size or "400x400 MM"
        category = "wall-tiles"
    elif "CARVING" in upper or re.search(r"\bC-\d", upper):
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        finish = "Matt"
        surface = "Carving"
        pattern = "Carving"
    elif "3D" in upper:
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        pattern = "3D"
    elif "GLITTER" in upper:
        category = "wall-tiles"
        size = size or "400x400 MM"
        pattern = "Glitter"
    elif "PARKING" in upper:
        category = "parking-tiles"
        size = size or "400x400 MM"
    elif "GLOSSY" in upper or "HIGH GLOSSY" in upper:
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        finish = "Glossy"
        surface = "Polished"
        pattern = "Glossy"
    elif "WOODEN" in upper or "WOOD" in upper:
        category = "wooden-strip"
        size = size or "600x1200 MM"
        finish = "Matt"
        surface = "Matt Wood"
        pattern = "Wood"
    elif any(tok in upper for tok in ("FISH", "FLOWER", "SCENERY")):
        category = "wall-tiles"
        size = size or "300x450 MM"
        pattern = stem.split()[0].capitalize()
    elif "SPECIAL COLOUR" in upper or "SPECIAL" in upper:
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        pattern = "Special"
    elif "W&M" in upper or "W & M" in upper:
        category = "wall-tiles"
        size = size or "300x600 MM"
        pattern = "Wall & Matt"
    elif "GOLDEN" in upper:
        category = "gvt-pgvt"
        size = size or "600x1200 MM"
        finish = "Glossy"
        surface = "Polished"
        pattern = "Golden"

    if not size:
        size = normalize_size(stem) or "400x400 MM"

    collection = derive_collection_name(stem)
    series_slug = slugify(collection) or slugify(stem)

    meta = {
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
    if root is not None:
        meta["pdf_catalog_url"] = pdf_public_url(pdf_path, root)
    return meta
