import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'content', 'valenza-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const PLACEHOLDER = '/images/products/floor-tiles.jpg';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

function fetchBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) {
      reject(new Error('too many redirects'));
      return;
    }
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: HEADERS, timeout: 45000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(new URL(res.headers.location, url).toString(), redirects + 1)
          .then(resolve)
          .catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
  });
}

function extractMurls(html) {
  const urls = [];
  for (const m of html.matchAll(/murl&quot;:&quot;(https?:.+?)&quot;/g)) {
    urls.push(m[1].replace(/&amp;/g, '&'));
  }
  return [...new Set(urls)];
}

async function searchImages(query) {
  const url =
    'https://www.bing.com/images/async?q=' +
    encodeURIComponent(query) +
    '&first=0&count=35&relp=35&tsc=ImageBasicHover&datsrc=I&layout=RowBased&mmasync=1';
  return extractMurls((await fetchBuffer(url)).toString('utf8'));
}

function setProductImage(product, imagePath) {
  product.image = imagePath;
  product.images = [imagePath];
  product.imageThumb = imagePath;
  product.imageMedium = imagePath;
}

async function downloadForProduct(product, used) {
  const dir = path.join(root, 'public', 'products', product.category);
  fs.mkdirSync(dir, { recursive: true });
  const outRel = `/products/${product.category}/${product.slug}.webp`;
  const outPath = path.join(root, 'public', outRel.replace(/^\//, ''));

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 3000) {
    setProductImage(product, outRel);
    console.log(`  reuse ${outRel}`);
    return true;
  }

  const query = `${product.name} ceramic tile ${product.size || ''} ${product.category.replace(/-/g, ' ')}`.trim();
  console.log(`  search: ${query}`);
  const urls = await searchImages(query);
  console.log(`  candidates: ${urls.length}`);

  for (const imageUrl of urls) {
    if (used.has(imageUrl)) continue;
    try {
      const buffer = await fetchBuffer(imageUrl);
      if (!buffer || buffer.length < 3000) continue;
      const head = buffer.slice(0, 20).toString('utf8').toLowerCase();
      if (head.includes('<html') || head.includes('<!doctype')) continue;
      await sharp(buffer)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88, effort: 6 })
        .toFile(outPath);
      used.add(imageUrl);
      setProductImage(product, outRel);
      console.log(`  saved ${outRel} (${Math.round(buffer.length / 1024)}kb)`);
      return true;
    } catch (error) {
      console.log(`  skip: ${error.message}`);
    }
  }
  return false;
}

function remapExistingProducts() {
  let remapped = 0;
  for (const product of catalog.products) {
    const expected = `/products/${product.category}/${product.slug}.webp`;
    const local = path.join(root, 'public', expected.replace(/^\//, ''));
    if (fs.existsSync(local) && fs.statSync(local).size > 3000) {
      if (
        product.image !== expected ||
        product.imageThumb !== expected ||
        product.imageMedium !== expected ||
        !(product.images || []).includes(expected)
      ) {
        setProductImage(product, expected);
        remapped++;
      }
    }
  }
  return remapped;
}

function firstProductImage(category) {
  const p = catalog.products.find(
    (x) =>
      x.category === category &&
      x.image &&
      x.image.startsWith('/products/') &&
      fs.existsSync(path.join(root, 'public', x.image.replace(/^\//, ''))),
  );
  return p?.image || null;
}

function updateCategoryImages() {
  let n = 0;
  for (const cat of catalog.categories || []) {
    const img = cat.image || '';
    const needs =
      !img ||
      img.includes('/images/products/') ||
      !fs.existsSync(path.join(root, 'public', img.replace(/^\//, '')));
    if (!needs) continue;
    const next = firstProductImage(cat.category);
    if (next) {
      cat.image = next;
      n++;
      console.log(`category ${cat.category}/${cat.slug} -> ${next}`);
    }
  }
  return n;
}

async function main() {
  console.log('1) Remap products that already have slug-named local files...');
  const remapped = remapExistingProducts();
  console.log(`   remapped ${remapped}`);

  const needsDownload = catalog.products.filter((p) => {
    const expected = `/products/${p.category}/${p.slug}.webp`;
    const local = path.join(root, 'public', expected.replace(/^\//, ''));
    return (
      p.image === PLACEHOLDER ||
      p.image?.includes('/images/products/') ||
      !fs.existsSync(local)
    );
  });

  console.log(`\n2) Download missing product images: ${needsDownload.length}`);
  const used = new Set();
  let ok = 0;
  for (const product of needsDownload) {
    console.log(`\n${product.slug} (${product.category})`);
    if (await downloadForProduct(product, used)) ok += 1;
    else console.log(`  FAILED ${product.slug}`);
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\n3) Update category images...');
  const cats = updateCategoryImages();

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`\ndone downloads=${ok}/${needsDownload.length} remapped=${remapped} categories=${cats}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
