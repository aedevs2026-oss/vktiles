import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'content', 'valenza-catalog.json');
const categoryImagesPath = path.join(root, 'lib', 'category-images.js');

const localMappings = {
  'elevation-tiles': {
    'el-401-facade': '/products/elevation-tiles/el-401-facade.webp',
    'el-402-facade': '/products/elevation-tiles/el-402-facade.webp',
    'el-403-facade': '/products/elevation-tiles/el-403-facade.webp',
    'el-501-elevation': '/products/elevation-tiles/el-501-elevation.webp',
    'el-502-elevation': '/products/elevation-tiles/el-502-elevation.webp',
    'el-503-elevation': '/products/elevation-tiles/el-503-elevation.webp',
    'el-504-elevation': '/products/elevation-tiles/el-504-elevation.webp',
    'el-601-large-facade': '/products/elevation-tiles/el-601-large-facade.webp',
    'el-602-large-facade': '/products/elevation-tiles/el-602-large-facade.webp',
  },
  'elevation-natural-stones': {
    'sandstone-beige': '/products/elevation-natural-stones/sandstone-beige.webp',
    'granite-grey': '/products/elevation-natural-stones/granite-grey.webp',
    'slate-dark': '/products/elevation-natural-stones/slate-dark.webp',
    'travertine-cream': '/products/elevation-natural-stones/travertine-cream.webp',
  },
  'parking-tiles': {
    'park-grey': '/products/parking-tiles/park-grey.webp',
    'park-red': '/products/parking-tiles/park-red.webp',
    'park-yellow': '/products/parking-tiles/park-yellow.webp',
    'park-white': '/products/parking-tiles/park-white.webp',
    'park-300-grey': '/products/parking-tiles/park-300-grey.webp',
    'park-300-red': '/products/parking-tiles/park-300-red.webp',
    'park-500-grey': '/products/parking-tiles/park-500-grey.webp',
    'park-500-yellow': '/products/parking-tiles/park-500-yellow.webp',
    'park-600-grey': '/products/parking-tiles/park-600-grey.webp',
    'park-600-red': '/products/parking-tiles/park-600-red.webp',
  },
};

function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const products = catalog.products || [];

  for (const product of products) {
    const mapping = localMappings[product.category];
    if (!mapping || !product.slug) continue;
    const localPath = mapping[product.slug];
    if (!localPath) continue;
    product.image = localPath;
    product.images = [localPath];
    product.imageThumb = localPath;
    product.imageMedium = localPath;
  }

  const categoryMap = {
    'elevation-tiles': '/products/elevation-tiles/el-401-facade.webp',
    'elevation-natural-stones': '/products/elevation-natural-stones/sandstone-beige.webp',
    'parking-tiles': '/products/parking-tiles/park-grey.webp',
  };

  for (const entry of catalog.categories || []) {
    if (entry.category && categoryMap[entry.category]) {
      entry.image = categoryMap[entry.category];
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  const categoryImagesContent = `/** Representative local VK / Valenza catalogue images per product line. */
export const CATEGORY_IMAGES = {
  "wall-tiles": "/products/wall-tiles/vz-2045-glossy-a.webp",
  "gvt-pgvt": "/products/gvt-pgvt/alfa-silver.webp",
  "parking-tiles": "/products/parking-tiles/park-grey.webp",
  "wooden-strip": "/products/wooden-strip/apricot-brown.webp",
  "elevation-tiles": "/products/elevation-tiles/el-401-facade.webp",
  "elevation-natural-stones": "/products/elevation-natural-stones/sandstone-beige.webp",
};

export const SUBCATEGORY_IMAGES = {
  "gvt-pgvt::600x600": "/products/gvt-pgvt/alfa-silver.webp",
  "gvt-pgvt::600x1200": "/products/gvt-pgvt/alfa-silver.webp",
  "gvt-pgvt::800x1600": "/products/gvt-pgvt/alfa-silver.webp",
  "gvt-pgvt::1200x1800": "/products/gvt-pgvt/alfa-silver.webp",
  "wall-tiles::300x600": "/products/wall-tiles/vz-5057-l-hl1-d.webp",
  "wall-tiles::300x450": "/products/wall-tiles/vz-2045-glossy-a.webp",
  "parking-tiles::300x300": "/products/parking-tiles/park-300-grey.webp",
  "parking-tiles::400x400": "/products/parking-tiles/park-grey.webp",
  "parking-tiles::500x500": "/products/parking-tiles/park-500-grey.webp",
  "parking-tiles::600x600": "/products/parking-tiles/park-600-grey.webp",
  "wooden-strip::200x1200": "/products/wooden-strip/apricot-brown.webp",
  "wooden-strip::200x900": "/products/wooden-strip/apricot-brown.webp",
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
`;

  fs.writeFileSync(categoryImagesPath, categoryImagesContent);
  console.log('Mapped local product images without remote URLs.');
}

main();
