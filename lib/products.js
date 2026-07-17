import "server-only";
import fs from "fs";
import path from "path";
import { generateCatalog } from "@/scripts/valenza-catalog-builder.mjs";
import { matchesSizeFilter } from "@/lib/catalog-filters";
import { resolveProductImages } from "@/lib/resolve-product-images";

export { CATEGORY_LABELS } from "@/lib/catalog-filters";

let _catalog = null;

function loadCatalogFromDisk() {
  try {
    const filePath = path.join(process.cwd(), "content", "valenza-catalog.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    }
  } catch {
    /* fall through */
  }
  return null;
}

function getCatalog() {
  if (!_catalog) {
    _catalog = loadCatalogFromDisk() || generateCatalog();
  }
  return _catalog;
}

export function getCategories() {
  return getCatalog().categories || [];
}

const DISPLAY_BRAND = "VK Tiles & Granites";

function normalizeProduct(product) {
  if (!product) return product;
  const images = resolveProductImages(product);
  return {
    ...product,
    ...images,
    brand: DISPLAY_BRAND,
    seo: product.seo
      ? {
          ...product.seo,
          title: product.seo.title?.replace(/Valenza Ceramic/gi, DISPLAY_BRAND),
          description: product.seo.description?.replace(/Valenza Ceramic/gi, DISPLAY_BRAND),
          keywords: product.seo.keywords?.map((k) =>
            k.replace(/Valenza Ceramic/gi, DISPLAY_BRAND)
          ),
        }
      : product.seo,
    description: product.description?.replace(/Valenza Ceramic/gi, DISPLAY_BRAND),
  };
}

export function getProducts() {
  return (getCatalog().products || []).map(normalizeProduct);
}

export function getProductBySlug(slug) {
  const product = getCatalog().products?.find((p) => p.slug === slug);
  return product ? normalizeProduct(product) : null;
}

export function getFeaturedProducts(limit = 8) {
  const featured = getProducts().filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const withImages = getProducts().filter((p) => p.image?.includes("valenzaceramic.com"));
  const pool = withImages.length >= limit ? withImages : getProducts();
  return pool.slice(0, limit);
}

export function getProductsByCategory(categorySlug, subcategorySlug) {
  return getProducts().filter((p) => {
    const matchCat = !categorySlug || p.category === categorySlug;
    const matchSub = !subcategorySlug || p.subcategory === subcategorySlug;
    return matchCat && matchSub;
  });
}

export function getRelatedProducts(product, limit = 8) {
  if (!product) return [];
  const all = getProducts().filter((p) => p.slug !== product.slug);

  const scored = all.map((p) => {
    let score = 0;
    if (p.category === product.category) score += 3;
    if (p.subcategory === product.subcategory) score += 2;
    if (p.size === product.size) score += 2;
    if (p.finish === product.finish) score += 1;
    if (p.collection === product.collection) score += 1;
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

export function getCategoryBySlug(slug) {
  return getCategories().find((c) => c.slug === slug || c.category === slug) || null;
}

export function getCatalogMeta() {
  const catalog = getCatalog();
  return {
    count: catalog.count || getProducts().length,
    scrapedAt: catalog.scrapedAt || null,
    brand: catalog.brand || "VK Tiles & Granites",
  };
}

export function getFilterOptions() {
  const products = getProducts();
  const unique = (key) => [...new Set(products.map((p) => p[key]).filter(Boolean))].sort();

  return {
    categories: unique("category"),
    subcategories: unique("subcategory"),
    sizes: unique("size"),
    finishes: unique("finish"),
    surfaces: unique("surface"),
    patterns: unique("pattern"),
    thicknesses: unique("thickness"),
    collections: unique("collection"),
    availability: unique("availability"),
  };
}

export function searchProducts(query, filters = {}) {
  const q = (query || "").trim().toLowerCase();
  return getProducts().filter((p) => {
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.size || "").toLowerCase().includes(q) ||
      (p.finish || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.pattern || "").toLowerCase().includes(q) ||
      (p.collection || "").toLowerCase().includes(q);

    const matchCategory = !filters.category || p.category === filters.category;
    const matchSubcategory = !filters.subcategory || p.subcategory === filters.subcategory;
    const matchSize = matchesSizeFilter(p.size, filters.size);
    const matchFinish = !filters.finish || p.finish === filters.finish;
    const matchSurface = !filters.surface || p.surface === filters.surface;
    const matchPattern = !filters.pattern || p.pattern === filters.pattern;
    const matchThickness = !filters.thickness || p.thickness === filters.thickness;
    const matchCollection = !filters.collection || p.collection === filters.collection;
    const matchAvailability = !filters.availability || p.availability === filters.availability;

    return (
      matchQuery &&
      matchCategory &&
      matchSubcategory &&
      matchSize &&
      matchFinish &&
      matchSurface &&
      matchPattern &&
      matchThickness &&
      matchCollection &&
      matchAvailability
    );
  });
}
