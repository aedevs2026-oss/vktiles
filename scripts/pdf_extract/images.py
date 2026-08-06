"""Image extraction, filtering, and WebP output."""
from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from PIL import Image

from .constants import MAX_ASPECT_RATIO, MAX_FULLPAGE_ASPECT_RATIO, MIN_HERO_AREA, MIN_TILE_AREA, MIN_TILE_DIM


@dataclass
class PageImage:
    xref: int
    pixel_w: int
    pixel_h: int
    rect: tuple[float, float, float, float]
    pixel_area: int
    display_area: float


def is_logo_or_banner(pixel_w: int, pixel_h: int) -> bool:
    if pixel_w <= 0 or pixel_h <= 0:
        return True
    ratio = max(pixel_w, pixel_h) / min(pixel_w, pixel_h)
    if ratio > 2.8:
        return True
    if pixel_h < 200 and pixel_w > 600:
        return True
    if pixel_w < 200 and pixel_h > 600:
        return True
    return False


def is_tile_image(pixel_w: int, pixel_h: int, min_area: int = MIN_TILE_AREA, max_ratio: float = MAX_ASPECT_RATIO) -> bool:
    if pixel_w < MIN_TILE_DIM or pixel_h < MIN_TILE_DIM:
        return False
    if is_logo_or_banner(pixel_w, pixel_h):
        return False
    ratio = max(pixel_w, pixel_h) / min(pixel_w, pixel_h)
    if ratio > max_ratio:
        return False
    if pixel_w * pixel_h < min_area:
        return False
    return True


def is_fullpage_catalog_image(pixel_w: int, pixel_h: int) -> bool:
    """Relaxed filter for full-page catalog spreads (wider aspect ratios)."""
    return is_tile_image(
        pixel_w,
        pixel_h,
        min_area=MIN_TILE_AREA,
        max_ratio=MAX_FULLPAGE_ASPECT_RATIO,
    )


def extract_page_images(page, doc) -> list[PageImage]:
    """Collect embedded images with layout rects, deduped by display position."""
    seen_rects: set[tuple] = set()
    images: list[PageImage] = []

    for info in page.get_images(full=True):
        xref = info[0]
        try:
            base = doc.extract_image(xref)
            pixel_w = int(base.get("width", 0))
            pixel_h = int(base.get("height", 0))
        except Exception:
            continue

        for rect in page.get_image_rects(xref):
            key = tuple(round(v, 1) for v in (rect.x0, rect.y0, rect.x1, rect.y1))
            if key in seen_rects:
                continue
            seen_rects.add(key)
            display_area = (rect.x1 - rect.x0) * (rect.y1 - rect.y0)
            images.append(
                PageImage(
                    xref=xref,
                    pixel_w=pixel_w,
                    pixel_h=pixel_h,
                    rect=(rect.x0, rect.y0, rect.x1, rect.y1),
                    pixel_area=pixel_w * pixel_h,
                    display_area=display_area,
                )
            )
    return images


def load_image_from_xref(doc, xref: int) -> Image.Image | None:
    try:
        base = doc.extract_image(xref)
        data = base.get("image")
        if not data:
            return None
        return Image.open(BytesIO(data)).convert("RGB")
    except Exception:
        return None


def save_webp(img: Image.Image, dest: Path, max_side: int = 1600, quality: int = 85) -> bool:
    if dest.exists():
        return True
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        out = img.convert("RGB")
        out.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        out.save(dest, format="WEBP", quality=quality, method=6)
        return True
    except Exception:
        return False


def rel_image_path(series_slug: str, product_slug: str, index: int = 0) -> str:
    suffix = f"-{index}" if index > 0 else ""
    return f"/products/vk-pdf/{series_slug}/{product_slug}{suffix}.webp"


def abs_image_path(root: Path, rel_path: str) -> Path:
    return root / "public" / rel_path.lstrip("/")


def filter_fullpage_images(images: list[PageImage]) -> list[PageImage]:
    filtered = [img for img in images if is_fullpage_catalog_image(img.pixel_w, img.pixel_h)]
    return sorted(filtered, key=lambda i: (-i.pixel_area, -i.display_area))


def filter_tile_images(images: list[PageImage], hero: bool = False) -> list[PageImage]:
    min_area = MIN_HERO_AREA if hero else MIN_TILE_AREA
    filtered = [
        img
        for img in images
        if is_tile_image(img.pixel_w, img.pixel_h, min_area=min_area)
    ]
    return sorted(filtered, key=lambda i: (-i.pixel_area, -i.display_area))


def center_x(rect: tuple[float, float, float, float]) -> float:
    return (rect[0] + rect[2]) / 2


def match_name_to_hero(names: list[tuple[str, tuple]], heroes: list[PageImage]) -> list[tuple[str, PageImage | None]]:
    """Pair product names with the best tile image in the same column."""
    pairs: list[tuple[str, PageImage | None]] = []
    used: set[int] = set()

    for name, bbox in names:
        name_cx = (bbox[0] + bbox[2]) / 2
        name_cy = (bbox[1] + bbox[3]) / 2
        best_idx: int | None = None
        best_score = -1.0

        for idx, hero in enumerate(heroes):
            if idx in used:
                continue
            hero_cx = center_x(hero.rect)
            hero_cy = (hero.rect[1] + hero.rect[3]) / 2
            dx = abs(hero_cx - name_cx)
            if dx > 280:
                continue
            dy = abs(hero_cy - name_cy)
            score = hero.pixel_area - dx * 8 - dy * 3
            if score > best_score:
                best_score = score
                best_idx = idx

        if best_idx is not None:
            used.add(best_idx)
            pairs.append((name, heroes[best_idx]))
        else:
            pairs.append((name, None))

    return pairs
