/** Representative VK catalogue images per product line (vk-pdf only). */
export const CATEGORY_IMAGES = {
  "gvt-pgvt": "/products/vk-pdf/carving/cr-emflaks.webp",
  "wooden-strip": "/products/vk-pdf/wooden-matt/alaska-wool.webp",
};

export const SUBCATEGORY_IMAGES = {
  "gvt-pgvt::600x1200": "/products/vk-pdf/matt/emaspen-beige.webp",
  "wooden-strip::600x1200": "/products/vk-pdf/wooden-matt/alaska-wool.webp",
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
