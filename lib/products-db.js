import fs from "fs";
import path from "path";

const DISPLAY_BRAND = "VK Tiles & Granites";

export function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand || DISPLAY_BRAND,
    category: row.category_slug,
    subcategory: row.subcategory,
    collection: row.collection_name,
    collectionSlug: row.collection_slug,
    series: row.series,
    description: row.description,
    size: row.size,
    sizes: row.sizes || [],
    finish: row.finish,
    finishes: row.finishes || [],
    surface: row.surface,
    pattern: row.pattern,
    thickness: row.thickness,
    thicknesses: row.thicknesses || [],
    packing: row.packing || [],
    features: row.features || [],
    applications: row.applications || [],
    specifications: row.specifications || {},
    image: row.image,
    images: row.images || [],
    imageThumb: row.image_thumb || row.image,
    imageMedium: row.image_medium || row.image,
    availability: row.availability,
    featured: row.featured,
    sourcePdf: row.source_pdf,
    sourcePage: row.source_page,
    downloads: row.downloads || {},
    seo: row.seo || {},
    published: row.published,
    sortOrder: row.sort_order,
  };
}

export function productToRow(product) {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand || DISPLAY_BRAND,
    category_slug: product.category || product.category_slug,
    subcategory: product.subcategory,
    collection_slug: product.collectionSlug || product.collection_slug,
    collection_name: product.collection || product.collection_name,
    series: product.series,
    description: product.description,
    size: product.size,
    sizes: product.sizes || [],
    finish: product.finish,
    finishes: product.finishes || [],
    surface: product.surface,
    pattern: product.pattern,
    thickness: product.thickness,
    thicknesses: product.thicknesses || [],
    packing: product.packing || [],
    features: product.features || [],
    applications: product.applications || [],
    specifications: product.specifications || {},
    image: product.image,
    images: product.images || [],
    image_thumb: product.imageThumb || product.image_thumb,
    image_medium: product.imageMedium || product.image_medium,
    availability: product.availability || "In Stock",
    featured: Boolean(product.featured),
    source_pdf: product.sourcePdf || product.source_pdf,
    source_page: product.sourcePage || product.source_page,
    downloads: product.downloads || {},
    seo: product.seo || {},
    published: product.published !== false,
    sort_order: product.sortOrder || product.sort_order || 0,
  };
}

export function writeCatalogJson(catalog) {
  const filePath = path.join(process.cwd(), "content", "vk-catalog.json");
  fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  return filePath;
}

export function buildCatalogFromProducts(products, categories = []) {
  return {
    scrapedAt: new Date().toISOString(),
    count: products.length,
    brand: DISPLAY_BRAND,
    source: "Supabase admin",
    categories,
    products,
    errors: [],
  };
}
