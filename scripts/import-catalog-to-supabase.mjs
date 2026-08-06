#!/usr/bin/env node
/**
 * Import content/vk-catalog.json into Supabase (idempotent upsert).
 *
 * - Inserts new products, updates existing ones on slug conflict
 * - Preserves existing images/descriptions when extraction data is incomplete
 * - Reuses local image files when paths already exist under public/
 *
 * Usage:
 *   node scripts/import-catalog-to-supabase.mjs
 *   npm run import-supabase
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
const publicDir = path.join(root, "public");

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

/** Return true when a local public image path exists on disk. */
function localImageExists(imagePath) {
  if (!imagePath || typeof imagePath !== "string" || !imagePath.startsWith("/")) {
    return false;
  }
  return fs.existsSync(path.join(publicDir, imagePath.replace(/^\//, "")));
}

/** Prefer extracted images; fall back to existing DB paths when missing or absent on disk. */
function resolveImages(product, existing) {
  let image = product.image || null;
  let images = Array.isArray(product.images) ? [...product.images] : [];

  if (image && !localImageExists(image)) {
    image = null;
  }
  images = images.filter((p) => localImageExists(p));

  if (!image && images.length > 0) {
    image = images[0];
  }

  if (existing) {
    if (!image && existing.image && localImageExists(existing.image)) {
      image = existing.image;
    }
    if (images.length === 0 && Array.isArray(existing.images)) {
      images = existing.images.filter((p) => localImageExists(p));
    }
    if (!image && images.length > 0) {
      image = images[0];
    }
  }

  return { image, images };
}

function mergeSpecifications(existing, incoming) {
  const base = existing?.specifications || {};
  const next = incoming?.specifications || {};
  const merged = { ...base, ...next };
  for (const [k, v] of Object.entries(next)) {
    if (v == null || v === "") {
      merged[k] = base[k];
    }
  }
  return merged;
}

function mergeProductRow(product, existing) {
  const row = productToRow(product);

  if (existing) {
    const { image, images } = resolveImages(product, existing);
    row.image = image;
    row.images = images;
    row.image_thumb = product.imageThumb || product.image_thumb || image;
    row.image_medium = product.imageMedium || product.image_medium || image;

    if (!row.description && existing.description) {
      row.description = existing.description;
    }

    row.specifications = mergeSpecifications(existing, product);

    if (!row.finish && existing.finish) row.finish = existing.finish;
    if (!row.size && existing.size) row.size = existing.size;
    if (!row.collection_name && existing.collection_name) {
      row.collection_name = existing.collection_name;
    }
    if (!row.collection_slug && existing.collection_slug) {
      row.collection_slug = existing.collection_slug;
    }
  } else {
    const { image, images } = resolveImages(product, null);
    row.image = image;
    row.images = images;
    row.image_thumb = product.imageThumb || product.image_thumb || image;
    row.image_medium = product.imageMedium || product.image_medium || image;
  }

  row.collection_slug = row.collection_slug || slugify(product.collection);
  return row;
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
      map.set(slug, {
        slug,
        name: p.collection,
        category_slug: p.category,
        blurb: `VK ${p.collection} — ${p.size}`,
        image: p.image,
        source_pdf: p.series,
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
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, image, images, description, specifications, finish, size, collection_name, collection_slug",
      )
      .in("slug", batch);
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
    const slice = uniqueProducts.slice(i, i + batchSize);
    const batch = slice.map((p) => {
      const existing = existingBySlug.get(p.slug);
      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
        existingBySlug.set(p.slug, p);
      }
      return mergeProductRow(p, existing);
    });

    const { error } = await supabase.from("products").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }

  console.log(`✓ Products inserted:  ${inserted}`);
  console.log(`✓ Products updated:   ${updated}`);
  console.log(`  Duplicates skipped: ${duplicatesSkipped}`);
  console.log(`✓ Total in catalog:   ${uniqueProducts.length}`);
}

async function main() {
  console.log("Importing VK catalog to Supabase...");
  console.log(`Catalog: ${catalog.count ?? catalog.products?.length} products\n`);
  await upsertCategories();
  await upsertCollections();
  await upsertProducts();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
