/**
 * Valenza Ceramic catalog scraper
 * Run: node scripts/fetch-valenza-catalog.mjs
 * Output: content/valenza-catalog.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateCatalog } from "./valenza-catalog-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://www.valenzaceramic.com";
const OUT = path.join(__dirname, "..", "content", "valenza-catalog.json");

const CATEGORY_URLS = [
  { url: "/product_category/gvtpgvt.html", category: "gvt-pgvt", subcategory: "gvt-pgvt" },
  { url: "/product_category/gvt-pgvt-600-x-600-mm-glossy.html", category: "gvt-pgvt", subcategory: "600x600", finish: "Glossy" },
  { url: "/product_category/gvtpgvt-60x120-cm-glossy.html", category: "gvt-pgvt", subcategory: "600x1200", finish: "Glossy" },
  { url: "/product_category/gvtpgvt-60x120-cm-matt.html", category: "gvt-pgvt", subcategory: "600x1200", finish: "Matt" },
  { url: "/product_category/gvtpgvt-60x120-cm.html", category: "gvt-pgvt", subcategory: "600x1200" },
  { url: "/product_category/gvt-pgvt-80x160-cm-glossy.html", category: "gvt-pgvt", subcategory: "800x1600", finish: "Glossy" },
  { url: "/product_category/gvt-pgvt-120x180-cm-glossy.html", category: "gvt-pgvt", subcategory: "1200x1800", finish: "High Gloss" },
  { url: "/product_category/slab-tiles-120x120-cm-matt.html", category: "gvt-pgvt", subcategory: "1200x1200", finish: "Matt" },
  { url: "/product_category/wall-tiles.html", category: "wall-tiles", subcategory: "300x600" },
  { url: "/product_category/wall-tiles-30x45-cm.html", category: "wall-tiles", subcategory: "300x450" },
  { url: "/product_category/wall-tiles-60x120-cm.html", category: "wall-tiles", subcategory: "600x1200" },
  { url: "/product_category/wooden-strip.html", category: "wooden-strip", subcategory: "200x1200" },
  { url: "/product_category/wooden-strip-20x90-cm.html", category: "wooden-strip", subcategory: "200x900" },
  { url: "/product_category/parking-tiles.html", category: "parking-tiles" },
  { url: "/product_category/parking-tiles-30x30-cm.html", category: "parking-tiles", subcategory: "300x300" },
  { url: "/product_category/parking-tiles-40x40-cm.html", category: "parking-tiles", subcategory: "400x400" },
  { url: "/product_category/parking-tiles-50x50-cm.html", category: "parking-tiles", subcategory: "500x500" },
  { url: "/product_category/parking-tiles-60x60-cm.html", category: "parking-tiles", subcategory: "600x600" },
  { url: "/product_category/elevation-tiles.html", category: "elevation-tiles", subcategory: "300x600" },
  { url: "/product_category/elevation-tiles-30x45-cm.html", category: "elevation-tiles", subcategory: "300x450" },
  { url: "/product_category/elevation-tiles-60x120-cm.html", category: "elevation-tiles", subcategory: "600x1200" },
  { url: "/product_category/elevation-natural-stones.html", category: "elevation-natural-stones", subcategory: "natural-stone" },
];

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function absUrl(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `${BASE}/${src.replace(/^\//, "")}`;
}

function parseSection(html) {
  const sections = [];
  const sectionRe = /<h2[^>]*>([^<]+)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  let m;
  while ((m = sectionRe.exec(html))) {
    const heading = m[1].replace(/\s+/g, " ").trim();
    const block = m[2];
    const products = [];
    const nameRe = /<h6[^>]*>([^<]+)<\/h6>/gi;
    let nm;
    while ((nm = nameRe.exec(block))) {
      const name = nm[1].replace(/\s+/g, " ").trim();
      if (name && !name.toLowerCase().includes("quick")) products.push(name);
    }
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/gi;
    const images = [];
    let im;
    while ((im = imgRe.exec(block))) {
      images.push({ src: absUrl(im[1]), alt: im[2] });
    }
    sections.push({ heading, products, images });
  }
  return sections;
}

function parseFinishSize(heading) {
  const h = heading.toUpperCase();
  let finish = "Glossy";
  if (h.includes("MATT")) finish = "Matt";
  else if (h.includes("HIGHGLOSS") || h.includes("HIGH GLOSS")) finish = "High Gloss";
  else if (h.includes("CARVING")) finish = "Carving";
  else if (h.includes("MOROCON")) finish = "Morocon";
  else if (h.includes("WOODEN")) finish = "Wooden";
  else if (h.includes("GLOSSY")) finish = "Glossy";

  const sizeMatch = h.match(/(\d+)\s*[xX×]\s*(\d+)\s*(CM|MM)?/);
  const size = sizeMatch
    ? `${sizeMatch[1]}x${sizeMatch[2]} ${(sizeMatch[3] || "CM").toUpperCase()}`
    : "";

  return { finish, size };
}

async function fetchPage(urlPath) {
  const res = await fetch(`${BASE}${urlPath}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VKTilesCatalog/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlPath}`);
  return res.text();
}

async function scrapeLive() {
  const products = [];
  const errors = [];
  const seen = new Set();

  for (const cat of CATEGORY_URLS) {
    try {
      console.log(`Fetching ${cat.url}...`);
      const html = await fetchPage(cat.url);
      const sections = parseSection(html);

      for (const section of sections) {
        const { finish, size } = parseFinishSize(section.heading);
        const resolvedSize = cat.size || size;
        const resolvedFinish = cat.finish || finish;

        section.products.forEach((name, i) => {
          const slug = slugify(name);
          if (!slug || seen.has(slug)) return;
          seen.add(slug);

          const img = section.images[i]?.src || section.images[0]?.src || "";
          products.push({
            slug,
            name,
            category: cat.category,
            subcategory: cat.subcategory || slugify(resolvedSize),
            size: resolvedSize,
            finish: resolvedFinish,
            image: img,
            sourceUrl: `${BASE}${cat.url}`,
          });
        });
      }
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      errors.push({ url: cat.url, error: err.message });
      console.warn(`  Error: ${err.message}`);
    }
  }

  return { products, errors };
}

async function main() {
  console.log("Valenza catalog fetch starting...");
  let liveProducts = [];
  let errors = [];

  try {
    const live = await scrapeLive();
    liveProducts = live.products;
    errors = live.errors;
    console.log(`Scraped ${liveProducts.length} products from website`);
  } catch (err) {
    console.warn("Live scrape unavailable, using seed data:", err.message);
  }

  const catalog = generateCatalog(liveProducts.length ? liveProducts : undefined);
  catalog.errors = errors;
  catalog.scrapedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));
  console.log(`Wrote ${catalog.count} products → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
