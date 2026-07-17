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
const dir = path.join(root, 'public', 'products', 'elevation-natural-stones');
fs.mkdirSync(dir, { recursive: true });

const files = [
  ['sandstone-beige', 'sandstone beige natural stone elevation cladding tile'],
  ['granite-grey', 'granite grey natural stone elevation cladding tile'],
  ['slate-dark', 'slate dark natural stone elevation wall cladding'],
  ['travertine-cream', 'travertine cream natural stone elevation cladding tile'],
];

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

async function main() {
  let count = 0;
  const used = new Set();
  for (const [name, query] of files) {
    const outPath = path.join(dir, `${name}.webp`);
    console.log(`\nsearch ${name}: ${query}`);
    try {
      const urls = await searchImages(query);
      console.log(`  candidates: ${urls.length}`);
      let saved = false;
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
          count += 1;
          saved = true;
          console.log(`  saved ${path.relative(root, outPath)} (${Math.round(buffer.length / 1024)}kb)`);
          break;
        } catch (error) {
          console.log(`  skip: ${error.message}`);
        }
      }
      if (!saved) console.log(`  failed ${name}`);
    } catch (error) {
      console.log(`  skip ${name}: ${error.message}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\ndone ${count}/${files.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
