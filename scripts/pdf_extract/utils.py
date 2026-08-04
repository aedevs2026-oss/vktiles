"""Text and slug utilities for PDF extraction."""
from __future__ import annotations

import hashlib
import re

from .constants import SKIP_NAME_TOKENS

SIZE_RE = re.compile(r"(\d{2,4})\s*[x×]\s*(\d{2,4})\s*(MM|CM)?", re.IGNORECASE)
THICKNESS_RE = re.compile(r"(\d+(?:\.\d+)?)\s*MM", re.IGNORECASE)
FINISH_RE = re.compile(r"FINISH\s*:\s*([A-Z\s+]+)", re.IGNORECASE)
RANDOM_RE = re.compile(r"(\d+)\s*RANDOM", re.IGNORECASE)
PRODUCT_CODE_RE = re.compile(r"^[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)*(?:\s+[A-Z]{2,})*$")
NOISE_RE = re.compile(r"[^A-Za-z0-9&'./+\- _]", re.ASCII)


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").strip().lower()).strip("-")


def norm_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().upper())


def file_sha256(path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def clean_ocr_text(text: str) -> str:
    text = text.replace("|", " ").replace("\u200c", "")
    text = NOISE_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return normalize_spaced_letters(text.upper())


def normalize_spaced_letters(text: str) -> str:
    """Merge OCR output like 'E M A S P E N' into 'EMASPEN'."""
    parts = text.split()
    if not parts:
        return text
    merged: list[str] = []
    buf = ""
    for part in parts:
        if len(part) == 1 and part.isalpha():
            buf += part
            continue
        if buf:
            merged.append(buf)
            buf = ""
        merged.append(part)
    if buf:
        merged.append(buf)
    return " ".join(merged)


def normalize_size(raw: str | None) -> str | None:
    if not raw:
        return None
    compact = raw.replace(" ", "")
    m = SIZE_RE.search(compact) or SIZE_RE.search(raw)
    if not m:
        return None
    a, b, unit = m.group(1), m.group(2), (m.group(3) or "MM").upper()
    return f"{a}x{b} {unit}"


def subcategory_from_size(size: str | None) -> str:
    if not size:
        return "standard"
    return size.split()[0].lower().replace("×", "x")


def parse_finish(text: str) -> str | None:
    m = FINISH_RE.search(text)
    if not m:
        return None
    return re.sub(r"\s+", " ", m.group(1).strip())


def parse_random_count(text: str) -> str | None:
    m = RANDOM_RE.search(text)
    if not m:
        return None
    return f"{m.group(1)} Random"


def is_product_code(text: str) -> bool:
    t = norm_name(text)
    if len(t) < 3 or len(t) > 40:
        return False
    words = t.split()
    if any(w in SKIP_NAME_TOKENS for w in words) and "_" not in t:
        return False
    if SIZE_RE.search(t.replace(" ", "")):
        return False
    if THICKNESS_RE.fullmatch(t):
        return False
    if re.fullmatch(r"[\d\s./-]+", t):
        return False
    # Product codes usually have underscore or mixed alnum
    if "_" in t:
        return PRODUCT_CODE_RE.match(t) is not None
    if any(c.isdigit() for c in t) and any(c.isalpha() for c in t):
        return True
    return PRODUCT_CODE_RE.match(t) is not None and len(words) <= 3


def merge_split_lines(lines: list[str]) -> list[str]:
    """Join lines that were split mid-word by PDF text extraction."""
    merged: list[str] = []
    buf = ""
    for line in lines:
        line = line.strip()
        if not line:
            if buf:
                merged.append(buf)
                buf = ""
            continue
        if buf and not buf.endswith(("-", "/")) and line[0].islower():
            buf += line
        elif buf:
            merged.append(buf)
            buf = line
        else:
            buf = line
    if buf:
        merged.append(buf)
    return merged
