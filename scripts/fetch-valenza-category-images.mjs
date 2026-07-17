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

const categoryPages = [
  { category: 'wall-tiles', page: '/product_category/wall-tiles.html' },
  { category: 'elevation-tiles', page: '/product_category/elevation-tiles.html' },
  { category: 'elevation-natural-stones', page: '/product_category/elevation-natural-stones.html' },
  { category: 'parking-tiles', page: '/product_category/parking-tiles.html' },
];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function extractPageLinks(html) {
  const hrefs = [];
  const regex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    hrefs.push(match[1]);
  }

  const pages = new Set();
  for (const href of hrefs) {
    try {
      const url = new URL(href, 'https://www.valenzaceramic.com');
      if (url.pathname.startsWith('/product_category/') && url.pathname.endsWith('.html')) {
        pages.add(url.pathname);
      }
    } catch {
      // ignore invalid URLs
    }
  }
  return [...pages];
}

function parseProductsFromHtml(html) {
  const items = [];
  const blocks = html.split(/<div[^>]*class=["'][^"']*product-image[^"']*["'][^>]*>/i);
  for (const block of blocks.slice(1)) {
    const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    const headingMatch = block.match(/<h6[^>]*class=["'][^"']*product-main-heading[^"']*["'][^>]*>(.*?)<\/h6>/is) || block.match(/<h6[^>]*>(.*?)<\/h6>/is) || block.match(/<div[^>]*class=["'][^"']*product-heading-box[^"']*["'][^>]*>(.*?)<\/div>/is);
    if (imgMatch && headingMatch) {
      const name = headingMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const src = imgMatch[1].trim();
      if (name && src) items.push({ name, src });
    }
  }
  return items;
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
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
  await sharp.default(sourcePath)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(destPath);
  return fs.existsSync(destPath);
}

async function processCatalogEntry(product, sourceMap, category) {
  const categoryDir = path.join(outDir, category);
  ensureDir(categoryDir);

  const slug = slugify(product.name || product.slug || 'product');
  const destPath = path.join(categoryDir, `${slug}.webp`);
  const localPath = `/products/${category}/${slug}.webp`;

  if (fs.existsSync(destPath)) {
    product.image = localPath;
    product.imageThumb = localPath;
    product.imageMedium = localPath;
    product.images = [localPath];
    return true;
  }

  const match = sourceMap.find((item) => normalize(item.name) === normalize(product.name));
  if (!match) return false;

  const tempPath = path.join(categoryDir, `${slug}-${createHash('md5').update(match.src).digest('hex').slice(0, 8)}.tmp`);
  try {
    const downloaded = await downloadImage(match.src, tempPath);
    if (!downloaded) return false;
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

  return false;
}

async function main() {
  let updated = 0;
  let missing = 0;

  for (const entry of categoryPages) {
    const pagesToScrape = new Set([entry.page]);
    const entryHtml = await fetchHtml(`https://www.valenzaceramic.com${entry.page}`);
    const relatedPages = extractPageLinks(entryHtml).filter((page) => page.toLowerCase().includes(entry.category.toLowerCase()));
    relatedPages.forEach((page) => pagesToScrape.add(page));

    for (const page of pagesToScrape) {
      const pageUrl = `https://www.valenzaceramic.com${page}`;
      const html = await fetchHtml(pageUrl);
      const sourceMap = parseProductsFromHtml(html);
      const categoryProducts = products.filter((product) => product.category === entry.category);
      for (const product of categoryProducts) {
        const ok = await processCatalogEntry(product, sourceMap, entry.category);
        if (ok) updated += 1;
        else missing += 1;
      }
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Updated ${updated} products with local images.`);
  console.log(`Could not resolve ${missing} products from official category pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
