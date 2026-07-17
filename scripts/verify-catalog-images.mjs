/**
 * Valenza returns HTTP 200 + HTML for missing /uploads/products/* URLs.
 * Regenerate content/verified-images.json after catalog changes.
 *
 * Usage: node scripts/verify-catalog-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "content", "valenza-catalog.json");
const outPath = path.join(root, "content", "verified-images.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const urls = new Set();
for (const p of catalog.products || []) {
  for (const u of [p.image, p.imageThumb, p.imageMedium, ...(p.images || [])]) {
    if (u) urls.add(u);
  }
}
for (const c of catalog.categories || []) {
  if (c.image) urls.add(c.image);
}

async function isRealImage(url) {
  try {
    const res = await fetch(url, {
      headers: { Range: "bytes=0-511" },
    });
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type.startsWith("image/")) return true;
    if (type.includes("html")) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return true;
    if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50) return true;
    return false;
  } catch {
    return false;
  }
}

const list = [...urls];
const good = [];
const bad = [];

console.log(`Checking ${list.length} image URLs…`);

for (let i = 0; i < list.length; i++) {
  const url = list[i];
  if ((i + 1) % 40 === 0) console.log(`  ${i + 1}/${list.length}`);
  if (await isRealImage(url)) good.push(url);
  else bad.push(url);
}

fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      good,
      bad,
    },
    null,
    2
  )
);

console.log(`Done. good=${good.length} bad=${bad.length} → ${outPath}`);
