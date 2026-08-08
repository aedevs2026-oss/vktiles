#!/usr/bin/env node
/**
 * Import content/vk-catalog.json into Supabase (idempotent upsert).
 * Merges with existing rows so descriptions/images are not overwritten by empty values.
 *
 * Usage: node scripts/import-catalog-to-supabase.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { productToRow } from "../lib/products-db.js";
import { loadEnvLocal, root } from "./load-env.mjs";

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

const catalogPath = path.join(root, "content", "vk-catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_LABELS = {
  "gvt-pgvt": "GVT / PGVT Floor Tiles",
  "wooden-strip": "Wooden Strip",
  "wall-tiles": "Wall Tiles",
  "elevation-tiles": "Elevation Tiles",
  "parking-tiles": "Parking Tiles",
};

/** Return local image path if the file exists in public/, otherwise null. */
function localImagePath(relPath) {
  if (!relPath || typeof relPath !== "string") return null;
  if (relPath.startsWith("http")) return relPath;
  const normalized = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  const abs = path.join(root, "public", normalized);
  return fs.existsSync(abs) ? relPath : null;
}

function resolveProductImages(product) {
  const primary = localImagePath(product.image);
  const images = (product.images || [])
    .map((img) => localImagePath(img))
    .filter(Boolean);
  const image = primary || images[0] || product.image || null;
  const uniqueImages = image ? [image, ...images.filter((i) => i !== image)] : images;
  return { image, images: uniqueImages };
}

function mergeRow(newRow, existing) {
  if (!existing) return newRow;
  const merged = { ...newRow };
  if (!merged.description && existing.description) merged.description = existing.description;
  if (!merged.image && existing.image) merged.image = existing.image;
  if (!merged.images?.length && existing.images?.length) merged.images = existing.images;
  if (!merged.image_thumb && existing.image_thumb) merged.image_thumb = existing.image_thumb;
  if (!merged.image_medium && existing.image_medium) merged.image_medium = existing.image_medium;
  if (
    merged.specifications &&
    existing.specifications &&
    Object.keys(merged.specifications).length < Object.keys(existing.specifications).length
  ) {
    merged.specifications = { ...existing.specifications, ...merged.specifications };
  }
  if (merged.seo && existing.seo) {
    merged.seo = { ...existing.seo, ...merged.seo };
    if (!merged.seo.description && existing.seo.description) {
      merged.seo.description = existing.seo.description;
    }
  }
  return merged;
}

async function upsertCategories() {
  const slugs = [...new Set(catalog.products.map((p) => p.category))];
  const rows = slugs.map((slug, i) => ({
    slug,
    name: CATEGORY_LABELS[slug] || slug,
    blurb: `VK Tiles ${CATEGORY_LABELS[slug] || slug}`,
    image: catalog.products.find((p) => p.category === slug)?.image || null,
    sort_order: i,
    published: true,
  }));
  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ Categories upserted: ${rows.length}`);
}

async function upsertCollections() {
  const map = new Map();
  for (const p of catalog.products) {
    const slug = p.collectionSlug || slugify(p.collection);
    if (!map.has(slug)) {
      const sourcePdf = p.sourcePdf || p.series || null;
      map.set(slug, {
        slug,
        name: p.collection,
        category_slug: p.category,
        blurb: `${catalog.brand || "VK Tiles & Granites"} — ${p.collection} (${p.size})`,
        image: p.image,
        source_pdf: sourcePdf,
        sort_order: map.size,
        published: true,
      });
    }
  }
  const rows = [...map.values()];
  const { error } = await supabase.from("collections").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ Collections upserted: ${rows.length}`);
}

async function fetchExistingProducts(slugs) {
  const bySlug = new Map();
  const batchSize = 50;
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const { data, error } = await supabase.from("products").select("*").in("slug", batch);
    if (error) throw error;
    for (const row of data || []) {
      bySlug.set(row.slug, row);
    }
  }
  return bySlug;
}

async function upsertProducts() {
  const batchSize = 100;
  const seenSlugs = new Set();
  let duplicatesSkipped = 0;
  let inserted = 0;
  let updated = 0;

  const uniqueProducts = [];
  for (const p of catalog.products) {
    if (seenSlugs.has(p.slug)) {
      duplicatesSkipped += 1;
      continue;
    }
    seenSlugs.add(p.slug);
    uniqueProducts.push(p);
  }

  const existingBySlug = await fetchExistingProducts(uniqueProducts.map((p) => p.slug));

  for (let i = 0; i < uniqueProducts.length; i += batchSize) {
    const batch = uniqueProducts.slice(i, i + batchSize).map((p) => {
      const { image, images } = resolveProductImages(p);
      const product = { ...p, image, images, imageThumb: image, imageMedium: image };
      const row = productToRow(product);
      row.collection_slug = p.collectionSlug || slugify(p.collection);
      return mergeRow(row, existingBySlug.get(row.slug));
    });

    for (const row of batch) {
      if (existingBySlug.has(row.slug)) {
        updated += 1;
      } else {
        inserted += 1;
        existingBySlug.set(row.slug, row);
      }
    }

    const { error } = await supabase.from("products").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }

  console.log(`✓ Products inserted:  ${inserted}`);
  console.log(`✓ Products updated:   ${updated}`);
  console.log(`✓ Duplicates skipped: ${duplicatesSkipped}`);
  console.log(`✓ Total in catalog:   ${uniqueProducts.length}`);
}

async function main() {
  const brand = catalog.brand || "VK Tiles & Granites";
  const productCount = catalog.count ?? catalog.products?.length ?? 0;
  const failedPdfs = catalog.errors?.length ?? 0;

  console.log("Importing VK catalog to Supabase...");
  console.log(`Brand:   ${brand}`);
  console.log(`Catalog: ${productCount} products`);
  if (failedPdfs) {
    console.log(`Failed PDFs from extraction: ${failedPdfs}`);
    for (const name of catalog.errors || []) {
      console.log(`  - ${name}`);
    }
  }
  console.log();

  await upsertCategories();
  await upsertCollections();
  await upsertProducts();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
