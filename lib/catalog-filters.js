export const CATEGORY_LABELS = {
  "gvt-pgvt": "GVT / PGVT",
  "wall-tiles": "Wall Tiles",
  "parking-tiles": "Parking Tiles",
  "wooden-strip": "Wooden Strip",
  "elevation-tiles": "Elevation Tiles",
  "elevation-natural-stones": "Natural Stones",
};

export function normalizeSizeFilter(value) {
  if (!value) return "";
  return value.toLowerCase().replace(/\s*(cm|mm)\s*/gi, "").replace(/\s+/g, "");
}

export function matchesSizeFilter(productSize, filterValue) {
  if (!filterValue) return true;
  if (!productSize) return false;
  const norm = (s) => s.toLowerCase().replace(/\s*(cm|mm)\s*/gi, "").replace(/\s+/g, "");
  const pf = norm(productSize);
  const ff = norm(filterValue);
  if (pf === ff) return true;
  const toMm = (s) => {
    const m = s.match(/^(\d+)x(\d+)$/);
    if (!m) return s;
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (a < 100 && b < 100) return `${a * 10}x${b * 10}`;
    if (a >= 100 && b >= 100) return `${Math.round(a / 10)}x${Math.round(b / 10)}`;
    return s;
  };
  return toMm(pf) === toMm(ff) || pf.includes(ff) || ff.includes(pf);
}
