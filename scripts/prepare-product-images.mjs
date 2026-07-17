import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

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

function categorySlug(value) {
  return slugify(value || 'uncategorized');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function candidateUrls(product) {
  const urls = [];
  for (const key of ['image', 'imageMedium', 'imageThumb']) {
    const value = product[key];
    if (typeof value === 'string' && value.trim()) urls.push(value.trim());
  }
  for (const value of product.images || []) {
    if (typeof value === 'string' && value.trim()) urls.push(value.trim());
  }
  return [...new Set(urls)];
}

async function downloadImage(url, destPath) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) return false;
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
  return fs.existsSync(destPath);
}

async function convertToWebp(sourcePath, destPath) {
  const sharp = await import('sharp');
  await sharp.default(sourcePath).resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(destPath);
  return fs.existsSync(destPath);
}

async function processProduct(product) {
  const slug = slugify(product.name || product.slug || 'product');
  const category = categorySlug(product.category);
  const dir = path.join(outDir, category);
  ensureDir(dir);
  const destPath = path.join(dir, `${slug}.webp`);
  const localPath = `/products/${category}/${slug}.webp`;

  if (fs.existsSync(destPath)) {
    product.image = localPath;
    product.imageThumb = localPath;
    product.imageMedium = localPath;
    product.images = [localPath];
    return true;
  }

  for (const url of candidateUrls(product)) {
    if (!url.startsWith('http')) continue;
    const tempPath = path.join(dir, `${slug}-${createHash('md5').update(url).digest('hex').slice(0,8)}.tmp`);
    try {
      const downloaded = await downloadImage(url, tempPath);
      if (!downloaded) continue;
      const converted = await convertToWebp(tempPath, destPath);
      fs.unlinkSync(tempPath);
      if (converted) {
        product.image = localPath;
        product.imageThumb = localPath;
        product.imageMedium = localPath;
        product.images = [localPath];
        return true;
      }
    } catch {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }

  product.image = localPath;
  product.imageThumb = localPath;
  product.imageMedium = localPath;
  product.images = [localPath];
  return false;
}

async function main() {
  let count = 0;
  for (const product of products) {
    const ok = await processProduct(product);
    if (ok) count += 1;
  }
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Updated ${count} products with local image assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
