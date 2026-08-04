import { CATEGORY_IMAGES } from "@/lib/category-images";

/** VK catalogue categories — only lines with products from VKPdf */
export const HOME_PRODUCT_CATEGORIES = [
  {
    slug: "gvt-pgvt",
    name: "Floor Tiles (GVT/PGVT)",
    blurb: "Glazed & polished vitrified floor tiles — 600×1200 mm",
    dataCategory: "gvt-pgvt",
    image: CATEGORY_IMAGES["gvt-pgvt"],
  },
  {
    slug: "wooden-strip",
    name: "Wooden Strip",
    blurb: "Wood-look porcelain strips — 600×1200 mm",
    dataCategory: "wooden-strip",
    image: CATEGORY_IMAGES["wooden-strip"],
  },
  {
    slug: "wall-tiles",
    name: "Wall Tiles",
    blurb: "Decorative wall tiles — 400×400 mm (16×16)",
    dataCategory: "wall-tiles",
    image: CATEGORY_IMAGES["wall-tiles"],
  },
  {
    slug: "elevation-tiles",
    name: "Elevation Tiles",
    blurb: "High depth elevation tiles — 300×450 mm",
    dataCategory: "elevation-tiles",
    image: CATEGORY_IMAGES["elevation-tiles"],
  },
];

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
  const available = CATALOG_FILTER_CATEGORIES.map((c) => c.value);
  const category =
    initialFilters.category && available.includes(initialFilters.category)
      ? initialFilters.category
      : available[0] || "";
  const sizeOptions = getSizeOptionsForCategory(products, category);
  const sizeKey =
    initialFilters.subcategory ||
    initialFilters.size ||
    sizeOptions[0]?.key ||
    "";
  return { category, sizeKey };
}

export function getCatalogCollections(products, category) {
  if (!category) return [];
  const map = new Map();
  for (const p of products) {
    if (p.category !== category) continue;
    if (!map.has(p.collection)) {
      map.set(p.collection, {
        name: p.collection,
        slug: p.collectionSlug || p.collection,
        count: 0,
      });
    }
    map.get(p.collection).count += 1;
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
