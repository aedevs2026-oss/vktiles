#!/usr/bin/env node
/**
 * Import content/vk-catalog.json into Supabase (idempotent upsert).
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
  console.log(`[ok] Categories upserted: ${rows.length}`);
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
  console.log(`[ok] Collections upserted: ${rows.length}`);
}

async function fetchExistingSlugs(slugs) {
  const existing = new Set();
  const batchSize = 50;
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const { data, error } = await supabase.from("products").select("slug").in("slug", batch);
    if (error) throw error;
    for (const row of data || []) {
      existing.add(row.slug);
    }
  }
  return existing;
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

  const existingSlugs = await fetchExistingSlugs(uniqueProducts.map((p) => p.slug));

  for (let i = 0; i < uniqueProducts.length; i += batchSize) {
    const batch = uniqueProducts.slice(i, i + batchSize).map((p) => {
      const row = productToRow(p);
      row.collection_slug = p.collectionSlug || slugify(p.collection);
      return row;
    });

    for (const row of batch) {
      if (existingSlugs.has(row.slug)) {
        updated += 1;
      } else {
        inserted += 1;
        existingSlugs.add(row.slug);
      }
    }

    const { error } = await supabase.from("products").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }

  console.log(`[ok] Products inserted:  ${inserted}`);
  console.log(`[ok] Products updated:   ${updated}`);
  console.log(`[skip] Duplicates skipped: ${duplicatesSkipped}`);
  console.log(`[ok] Total in catalog:   ${uniqueProducts.length}`);
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
