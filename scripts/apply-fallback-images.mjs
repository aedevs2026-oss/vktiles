import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'content', 'valenza-catalog.json');
const outDir = path.join(root, 'public', 'products');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const products = catalog.products || [];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function copyOrConvert(sourcePath, destPath) {
  const sharp = await import('sharp');
  await sharp.default(sourcePath)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(destPath);
  return fs.existsSync(destPath);
}

const fallbackSources = {
  'wall-tiles': path.join(root, 'public', 'products', 'wall-tiles', 'vz-5057-l-hl1-d.webp'),
  'elevation-tiles': path.join(root, 'public', 'images', 'products', 'elevation-tiles.avif'),
  'elevation-natural-stones': path.join(root, 'public', 'images', 'products', 'natural-stones.jpg'),
  'parking-tiles': path.join(root, 'public', 'images', 'products', 'parking-tiles.jpg'),
};

(async () => {
  let updated = 0;
  for (const product of products) {
    const category = product.category;
    if (!fallbackSources[category]) continue;
    if (typeof product.image === 'string' && product.image.startsWith('/products/')) continue;
    const slug = slugify(product.name || product.slug || 'product');
    const categoryDir = path.join(outDir, category);
    fs.mkdirSync(categoryDir, { recursive: true });
    const destPath = path.join(categoryDir, `${slug}.webp`);
    const localPath = `/products/${category}/${slug}.webp`;
    if (!fs.existsSync(destPath)) {
      await copyOrConvert(fallbackSources[category], destPath);
    }
    product.image = localPath;
    product.imageThumb = localPath;
    product.imageMedium = localPath;
    product.images = [localPath];
    updated += 1;
  }
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Updated ${updated} catalog entries with fallback local images.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
