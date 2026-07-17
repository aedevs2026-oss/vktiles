/** Representative VK / Valenza catalogue images per product line (actual tile photography) */
export const CATEGORY_IMAGES = {
  "wall-tiles":
    "https://www.valenzaceramic.com/uploads/admin/product/VZ-5057_1596356952.png",
  "gvt-pgvt":
    "https://www.valenzaceramic.com/uploads/admin/product/Altero_Silver_-_R1__1698671098.jpg",
  "parking-tiles":
    "https://www.valenzaceramic.com/uploads/products/park-grey.jpg",
  "wooden-strip":
    "https://www.valenzaceramic.com/uploads/admin/product/Apricot_Brown_R1Master_copy_1596195725.png",
  "elevation-tiles":
    "https://www.valenzaceramic.com/uploads/products/el-501-elevation.jpg",
  "elevation-natural-stones":
    "https://www.valenzaceramic.com/uploads/products/sandstone-beige.jpg",
};

export const SUBCATEGORY_IMAGES = {
  "gvt-pgvt::600x600":
    "https://www.valenzaceramic.com/uploads/admin/product/Altero_Silver_-_R1__1698671098.jpg",
  "gvt-pgvt::600x1200":
    "https://www.valenzaceramic.com/uploads/admin/product/CEMENTO_DARK_GREY_R-1_1727177586.jpg",
  "gvt-pgvt::800x1600":
    "https://www.valenzaceramic.com/uploads/products/empire-statuario.jpg",
  "gvt-pgvt::1200x1800":
    "https://www.valenzaceramic.com/uploads/products/super-white-slab.jpg",
  "wall-tiles::300x600":
    "https://www.valenzaceramic.com/uploads/admin/product/VZ-5057_1596356952.png",
  "wall-tiles::300x450":
    "https://www.valenzaceramic.com/uploads/products/vz-2045-glossy-a.jpg",
  "parking-tiles::300x300":
    "https://www.valenzaceramic.com/uploads/products/park-300-grey.jpg",
  "parking-tiles::400x400":
    "https://www.valenzaceramic.com/uploads/products/park-grey.jpg",
  "parking-tiles::500x500":
    "https://www.valenzaceramic.com/uploads/products/park-500-grey.jpg",
  "parking-tiles::600x600":
    "https://www.valenzaceramic.com/uploads/products/park-600-grey.jpg",
  "wooden-strip::200x1200":
    "https://www.valenzaceramic.com/uploads/admin/product/Apricot_Brown_R1Master_copy_1596195725.png",
  "wooden-strip::200x900":
    "https://www.valenzaceramic.com/uploads/products/oak-natural.jpg",
  "elevation-tiles::300x450":
    "https://www.valenzaceramic.com/uploads/products/el-401-facade.jpg",
  "elevation-tiles::300x600":
    "https://www.valenzaceramic.com/uploads/products/el-501-elevation.jpg",
  "elevation-tiles::600x1200":
    "https://www.valenzaceramic.com/uploads/products/el-601-large-facade.jpg",
  "elevation-natural-stones::natural-stone":
    "https://www.valenzaceramic.com/uploads/products/sandstone-beige.jpg",
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
