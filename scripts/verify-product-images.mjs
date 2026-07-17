import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const catalogPath = path.join(root, 'content', 'valenza-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const products = catalog.products || [];
const refs = [];

for (const product of products) {
  for (const key of ['image', 'imageThumb', 'imageMedium']) {
    const value = product[key];
    if (typeof value === 'string' && value.startsWith('/')) {
      refs.push({ slug: product.slug, key, src: value });
    }
  }
  if (Array.isArray(product.images)) {
    for (const src of product.images) {
      if (typeof src === 'string' && src.startsWith('/')) {
        refs.push({ slug: product.slug, key: 'images', src });
      }
    }
  }
}

const bad = [];

for (const ref of refs) {
  const full = path.join(root, ref.src.replace(/^\//, ''));
  const exists = fs.existsSync(full);
  let ok = false;
  let err = '';
  if (exists) {
    try {
      const metadata = await sharp(full).metadata();
      ok = Boolean(metadata.format);
    } catch (error) {
      err = error.message;
    }
  }
  if (!exists || !ok) {
    bad.push({ slug: ref.slug, src: ref.src, exists, err });
  }
}

console.log('total refs', refs.length);
console.log('bad count', bad.length);
for (const item of bad.slice(0, 200)) {
  console.log(item.slug, item.src, 'exists=', item.exists, 'err=', item.err);
}
