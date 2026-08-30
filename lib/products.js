import "server-only";
import fs from "fs";
import path from "path";
import { matchesSizeFilter } from "@/lib/catalog-filters";
import { resolveProductImages } from "@/lib/resolve-product-images";

export { CATEGORY_LABELS } from "@/lib/catalog-filters";

let _catalog = null;

function loadCatalogFromDisk() {
  const candidates = ["vk-catalog.json", "valenza-catalog.json"];
  for (const name of candidates) {
    try {
      const filePath = path.join(process.cwd(), "content", name);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function getCatalog() {
  if (!_catalog) {
    _catalog = loadCatalogFromDisk() || { products: [], categories: [], count: 0 };
  }
  return _catalog;
}

export function clearCatalogCache() {
  _catalog = null;
}

export function getCategories() {
  return getCatalog().categories || [];
}

const DISPLAY_BRAND = "VK Tiles & Granites";

function isVkProduct(product) {
  const image = product?.image || "";
  if (image.startsWith("/products/")) return true;
  if (image.startsWith("https://") || image.startsWith("http://")) {
    return !image.includes("valenzaceramic.com");
  }
  return false;
}

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
  return (getCatalog().products || [])
    .filter(isVkProduct)
    .map(normalizeProduct);
}

export function getProductBySlug(slug) {
  const product = getCatalog().products?.find((p) => p.slug === slug && isVkProduct(p));
  return product ? normalizeProduct(product) : null;
}

export function getFeaturedProducts(limit = 8) {
  const featured = getProducts().filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const withImages = getProducts().filter((p) => Boolean(p.image));
  const pool = withImages.length >= limit ? withImages : getProducts();
  return pool.slice(0, limit);
}

function shuffleProducts(products) {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isVkNewLine(product) {
  const catalogPath = product.downloads?.catalog || "";
  return /vknew/i.test(catalogPath);
}

/** Pool of recently added catalogue lines (VkNew + tail of merged catalog). */
function buildNewArrivalPool() {
  const catalog = getCatalog();
  const rawList = catalog.products || [];
  const seen = new Set();
  const pool = [];

  for (let i = rawList.length - 1; i >= 0; i--) {
    const raw = rawList[i];
    if (!isVkProduct(raw)) continue;
    const product = normalizeProduct(raw);
    if (!product.image || seen.has(product.slug)) continue;

    const isRecentTail = i >= rawList.length - 400;
    if (!isRecentTail && !isVkNewLine(product)) continue;

    seen.add(product.slug);
    pool.push(product);
    if (pool.length >= 500) break;
  }

  if (pool.length < 12) {
    for (const p of getProducts()) {
      if (!p.image || seen.has(p.slug)) continue;
      seen.add(p.slug);
      pool.push(p);
      if (pool.length >= 100) break;
    }
  }

  return pool;
}

/** New arrivals sorted alphabetically so A-series and earlier inventory names lead the showcase. */
export function getNewArrivals(limit = 12) {
  const pool = buildNewArrivalPool();

  return [...pool]
    .sort((a, b) => {
      const aName = (a.name || "").trim();
      const bName = (b.name || "").trim();
      const aStartsWithA = /^a\b/i.test(aName) ? 0 : 1;
      const bStartsWithA = /^a\b/i.test(bName) ? 0 : 1;

      if (aStartsWithA !== bStartsWithA) return aStartsWithA - bStartsWithA;
      return aName.localeCompare(bName, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    })
    .slice(0, limit);
}

/** Popular picks from highest-volume collections in the catalogue. */
export function getBestSellers(limit = 12) {
  const all = getProducts().filter((p) => p.image);
  const seriesCount = {};
  for (const p of all) {
    const key = p.series || p.collectionSlug || "other";
    seriesCount[key] = (seriesCount[key] || 0) + 1;
  }

  const topSeries = Object.entries(seriesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([s]) => s);

  const pool = all.filter((p) => topSeries.includes(p.series || p.collectionSlug));
  const seen = new Set();
  const picks = [];

  for (const p of pool) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    picks.push(p);
    if (picks.length >= limit) break;
  }

  if (picks.length < limit) {
    for (const p of all) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      picks.push(p);
      if (picks.length >= limit) break;
    }
  }

  return picks;
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
    count: getProducts().length,
    scrapedAt: catalog.scrapedAt || null,
    brand: catalog.brand || DISPLAY_BRAND,
    source: catalog.source || "VKPdf local catalog",
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
