/** Representative VK catalogue images per product line (vk-pdf only). */
export const CATEGORY_IMAGES = {
  "gvt-pgvt": "/products/vk-pdf/carving/cr-emflaks.webp",
  "wooden-strip": "/products/vk-pdf/wooden-matt/alaska-wool.webp",
  "wall-tiles": "/products/vk-pdf/albert-boston/albert-01.webp",
  "elevation-tiles": "/products/vk-pdf/high-depth-elevation-02/high-depth-elevation-02-design-01.webp",
};

export const SUBCATEGORY_IMAGES = {
  "gvt-pgvt::600x1200": "/products/vk-pdf/matt/emaspen-beige.webp",
  "wooden-strip::600x1200": "/products/vk-pdf/wooden-matt/alaska-wool.webp",
  "wall-tiles::400x400": "/products/vk-pdf/albert-boston/albert-01.webp",
  "elevation-tiles::300x450": "/products/vk-pdf/high-depth-elevation-02/high-depth-elevation-02-design-01.webp",
};

export function getProductImage(product) {
  const key = `${product.category}::${product.subcategory}`;
  return (
    product.image ||
    product.imageMedium ||
    SUBCATEGORY_IMAGES[key] ||
    CATEGORY_IMAGES[product.category]
  );
}
