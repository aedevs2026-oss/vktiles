import { CATEGORY_IMAGES } from "@/lib/category-images";

/** Six product lines — shown on the homepage only */
export const HOME_PRODUCT_CATEGORIES = [
  {
    slug: "wall-tiles",
    name: "Wall Tiles",
    blurb: "Digital wall tiles for kitchens, bathrooms & interiors",
    dataCategory: "wall-tiles",
    image: CATEGORY_IMAGES["wall-tiles"],
  },
  {
    slug: "gvt-pgvt",
    name: "Floor Tiles (GVT/PGVT)",
    blurb: "Glazed & polished vitrified floor tiles",
    dataCategory: "gvt-pgvt",
    image: CATEGORY_IMAGES["gvt-pgvt"],
  },
  {
    slug: "parking-tiles",
    name: "Parking Tiles",
    blurb: "Heavy-duty outdoor parking & driveways",
    dataCategory: "parking-tiles",
    image: CATEGORY_IMAGES["parking-tiles"],
  },
  {
    slug: "wooden-strip",
    name: "Wooden Strip",
    blurb: "Wood-look porcelain strips",
    dataCategory: "wooden-strip",
    image: CATEGORY_IMAGES["wooden-strip"],
  },
  {
    slug: "elevation-tiles",
    name: "Elevation Tiles",
    blurb: "Exterior facade & elevation finishes",
    dataCategory: "elevation-tiles",
    image: CATEGORY_IMAGES["elevation-tiles"],
  },
  {
    slug: "elevation-natural-stones",
    name: "Natural Stones",
    blurb: "Natural stone elevation & landscape",
    dataCategory: "elevation-natural-stones",
    image: CATEGORY_IMAGES["elevation-natural-stones"],
  },
];

/** Catalog filter dropdown (same six lines) */
export const CATALOG_FILTER_CATEGORIES = HOME_PRODUCT_CATEGORIES.map((c) => ({
  value: c.dataCategory,
  label: c.name,
}));

export function formatSubcategoryLabel(sub) {
  if (!sub || sub === "natural-stone") return "Standard";
  return sub.replace(/x/g, "×");
}

export function getSizeOptionsForCategory(products, category) {
  if (!category || !products?.length) return [];
  const inCat = products.filter((p) => p.category === category);
  const map = new Map();
  for (const p of inCat) {
    const key = p.subcategory || p.size || "default";
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: formatSubcategoryLabel(key) || p.size || key,
        sampleSize: p.size,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function getDefaultCatalogSelection(products, initialFilters = {}) {
  const category =
    initialFilters.category || CATALOG_FILTER_CATEGORIES[0]?.value || "";
  const sizeOptions = getSizeOptionsForCategory(products, category);
  const sizeKey =
    initialFilters.subcategory ||
    initialFilters.size ||
    sizeOptions[0]?.key ||
    "";
  return { category, sizeKey };
}
