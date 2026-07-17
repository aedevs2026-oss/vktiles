import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'content', 'valenza-catalog.json');
const publicDir = path.join(root, 'public');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function categorySlug(value) {
  return slugify(value || 'uncategorized');
}

function localImageForProduct(product) {
  const category = categorySlug(product.category);
  const slug = slugify(product.name || product.slug || 'product');
  const specificPath = path.join(publicDir, 'products', category, `${slug}.webp`);
  if (fs.existsSync(specificPath)) {
    return `/products/${category}/${slug}.webp`;
  }

  const fallbackMap = {
    'gvt-pgvt': '/images/products/floor-tiles.jpg',
    'wall-tiles': '/images/products/floor-tiles.jpg',
    'parking-tiles': '/images/products/parking-tiles.jpg',
    'wooden-strip': '/images/products/floor-tiles.jpg',
    'elevation-tiles': '/images/products/elevation-tiles.avif',
    'elevation-natural-stones': '/images/products/natural-stones.jpg',
  };

  return fallbackMap[category] || '/images/products/floor-tiles.jpg';
}

for (const product of catalog.products || []) {
  const localImage = localImageForProduct(product);
  product.image = localImage;
  product.imageThumb = localImage;
  product.imageMedium = localImage;
  product.images = [localImage];
}

for (const category of catalog.categories || []) {
  const categoryKey = categorySlug(category.category || category.slug);
  const fallbackMap = {
    'gvt-pgvt': '/images/products/floor-tiles.jpg',
    'wall-tiles': '/images/products/floor-tiles.jpg',
    'parking-tiles': '/images/products/parking-tiles.jpg',
    'wooden-strip': '/images/products/floor-tiles.jpg',
    'elevation-tiles': '/images/products/elevation-tiles.avif',
    'elevation-natural-stones': '/images/products/natural-stones.jpg',
  };
  category.image = fallbackMap[categoryKey] || '/images/products/floor-tiles.jpg';
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('Updated catalog image references to local paths.');
