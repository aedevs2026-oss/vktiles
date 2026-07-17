/** Representative local VK / Valenza catalogue images per product line. */
export const CATEGORY_IMAGES = {
  "wall-tiles": "/products/wall-tiles/vz-2045-glossy-a.webp",
  "gvt-pgvt": "/products/gvt-pgvt/alfa-silver.webp",
  "parking-tiles": "/products/parking-tiles/park-grey.svg",
  "wooden-strip": "/products/wooden-strip/apricot-brown.webp",
  "elevation-tiles": "/products/elevation-tiles/el-401-facade.webp",
  "elevation-natural-stones": "/products/elevation-natural-stones/sandstone-beige.webp",
};

export const SUBCATEGORY_IMAGES = {
  "gvt-pgvt::600x600": "/products/gvt-pgvt/altero-silver.webp",
  "gvt-pgvt::600x1200": "/products/gvt-pgvt/cemento-dark-grey.webp",
  "gvt-pgvt::800x1600": "/products/gvt-pgvt/empire-statuario.webp",
  "gvt-pgvt::1200x1200": "/products/gvt-pgvt/arena-grey.webp",
  "gvt-pgvt::1200x1800": "/products/gvt-pgvt/super-white-slab.webp",
  "wall-tiles::300x600": "/products/wall-tiles/vz-5057-l-hl1-d.webp",
  "wall-tiles::300x450": "/products/wall-tiles/vz-2045-glossy-a.webp",
  "parking-tiles::300x300": "/products/parking-tiles/park-300-grey.svg",
  "parking-tiles::400x400": "/products/parking-tiles/park-grey.svg",
  "parking-tiles::500x500": "/products/parking-tiles/park-500-grey.svg",
  "parking-tiles::600x600": "/products/parking-tiles/park-600-grey.svg",
  "wooden-strip::200x1200": "/products/wooden-strip/apricot-brown.webp",
  "wooden-strip::200x900": "/products/wooden-strip/oak-natural.webp",
  "elevation-tiles::300x450": "/products/elevation-tiles/el-401-facade.webp",
  "elevation-tiles::300x600": "/products/elevation-tiles/el-501-elevation.webp",
  "elevation-tiles::600x1200": "/products/elevation-tiles/el-601-large-facade.webp",
  "elevation-natural-stones::natural-stone": "/products/elevation-natural-stones/sandstone-beige.webp",
};

export function getProductImage(product) {
  const key = `${product.category}::${product.subcategory}`;
  return (
    SUBCATEGORY_IMAGES[key] ||
    CATEGORY_IMAGES[product.category] ||
    product.image ||
    product.imageMedium
  );
}
