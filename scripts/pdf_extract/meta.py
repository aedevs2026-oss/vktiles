"""Infer collection, category, and size from PDF filenames."""
from __future__ import annotations

import re
from pathlib import Path

from .constants import LEGACY_PDF_CONFIGS
from .utils import normalize_size, slugify


# PDF source folders scanned recursively (relative to repo root).
PDF_SOURCE_DIRS = ("Vkpdf", "VKPdf", "public/VKNew", "public/VkNew")


def resolve_pdf_dirs(root: Path) -> list[Path]:
    """Return all existing PDF source directories."""
    dirs: list[Path] = []
    seen: set[str] = set()
    for name in PDF_SOURCE_DIRS:
        candidate = root / name
        key = str(candidate.resolve()).lower()
        if candidate.is_dir() and key not in seen:
            seen.add(key)
            dirs.append(candidate)
    if not dirs:
        dirs.append(root / "Vkpdf")
    return dirs


def resolve_pdf_dir(root: Path) -> Path:
    """Primary PDF directory (first match) — kept for backwards compatibility."""
    return resolve_pdf_dirs(root)[0]


def pdf_rel_path(pdf_path: Path, root: Path) -> str:
    """Public-relative path for catalog download links."""
    for base in (root / "public", root):
        try:
            rel = pdf_path.relative_to(base)
            return str(rel).replace("\\", "/")
        except ValueError:
            continue
    return pdf_path.name


def parse_feet_size(stem: str) -> str | None:
    """Convert poster sizes like 2X3, 4X6 (feet) to standard mm dimensions."""
    m = re.search(r"(?<![\d])(\d)\s*[x×]\s*(\d)(?![\d])", stem, re.IGNORECASE)
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    # Common VK poster feet → mm mappings used in catalog naming
    feet_to_mm = {
        (2, 3): "600x900 MM",
        (2, 4): "600x1200 MM",
        (4, 6): "1200x1800 MM",
        (6, 4): "1800x1200 MM",
    }
    return feet_to_mm.get((a, b))


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
    repo_root = root or pdf_path.parent
    while repo_root.parent != repo_root and not (repo_root / "package.json").exists():
        repo_root = repo_root.parent
    rel_pdf = pdf_rel_path(pdf_path, repo_root)

    legacy = LEGACY_PDF_CONFIGS.get(pdf_path.name)
    if legacy:
        meta = dict(legacy)
        meta.setdefault("series_slug", slugify(meta.get("collection", pdf_path.stem)))
        meta.setdefault("subcategory", meta.get("size", "600x1200 MM").split()[0].lower())
        meta["pdf_rel_path"] = rel_pdf
        return meta

    stem = pdf_path.stem
    upper = stem.upper()
    size = parse_feet_size(stem)
    category = "wall-tiles"
    finish = "Matt"
    surface = "Matt"
    pattern = "Decorative"

    m = re.search(r"(\d{3,4})\s*[x×]\s*(\d{3,4})\s*MM", upper)
    if m:
        size = f"{m.group(1)}x{m.group(2)} MM"

    if "CRYSTAL" in upper:
        finish = "Crystal"
        surface = "Crystal"
        pattern = "Crystal"
    elif re.search(r"HIGLSS|HIGH\s*GLOSS|GLOSSY", upper):
        finish = "High Glossy"
        surface = "Polished"
        pattern = "Plain" if "PLAIN" in upper else "Glitter" if "GLITTER" in upper else "Decorative"
    elif "GLITTER" in upper:
        category = "wall-tiles"
        pattern = "Glitter"
        finish = "Glossy"
        surface = "Glitter"

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
    elif "GLITTER" in upper and not re.search(r"HIGLSS|HIGH\s*GLOSS|GLOSSY", upper):
        category = "wall-tiles"
        size = size or "400x400 MM"
        pattern = "Glitter"
        finish = "Glossy"
        surface = "Glitter"
    elif "PARKING" in upper:
        category = "parking-tiles"
        size = size or "400x400 MM"

    if not size:
        size = normalize_size(stem) or "400x400 MM"

    collection = derive_collection_name(stem)
    series_slug = slugify(collection) or slugify(stem)
    is_poster = "POSTER" in upper or parse_feet_size(stem) is not None

    return {
        "series_slug": series_slug,
        "collection": collection,
        "category": category,
        "subcategory": size.split()[0].lower(),
        "size": size,
        "finish": finish,
        "surface": surface,
        "pattern": pattern,
        "pdf_rel_path": rel_pdf,
        "is_poster": is_poster,
    }
