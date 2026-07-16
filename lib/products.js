import catalog from "@/content/simpolo-catalog.json";

export function getCategories() {
  return catalog.categories || [];
}

export function getProducts() {
  return catalog.products || [];
}

export function getProductBySlug(slug) {
  return getProducts().find((p) => p.slug === slug) || null;
}

export function getFeaturedProducts(limit = 8) {
  const featured = getProducts().filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return getProducts().slice(0, limit);
}

export function getProductsByCategory(categorySlug) {
  return getProducts().filter((p) => p.category === categorySlug || p.collectionSlug === categorySlug);
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return getProducts()
    .filter((p) => p.slug !== product.slug && p.collectionSlug === product.collectionSlug)
    .slice(0, limit);
}

export function getCategoryBySlug(slug) {
  return getCategories().find((c) => c.slug === slug) || null;
}

export function getCatalogMeta() {
  return {
    count: catalog.count || getProducts().length,
    scrapedAt: catalog.scrapedAt || null,
  };
}
