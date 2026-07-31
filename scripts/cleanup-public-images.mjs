#!/usr/bin/env node
/**
 * Remove unreferenced images from public/.
 * Keeps only paths referenced in vk-catalog.json and site-content.json (local / paths).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");

const KEEP_ROOT_FILES = new Set([
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
]);

function walkJsonPaths(value, out) {
  if (!value) return;
  if (typeof value === "string") {
    if (value.startsWith("/products/") || value.startsWith("/images/")) {
      out.add(value.replace(/\\/g, "/"));
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walkJsonPaths(v, out));
    return;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((v) => walkJsonPaths(v, out));
  }
}

function loadKeepSet() {
  const keep = new Set();

  for (const file of ["content/vk-catalog.json", "content/site-content.json"]) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      walkJsonPaths(JSON.parse(fs.readFileSync(full, "utf8")), keep);
    }
  }

  // Category fallbacks used by the live site (vk-pdf only)
  [
    "/products/vk-pdf/carving/cr-emflaks.webp",
    "/products/vk-pdf/wooden-matt/alaska-wool.webp",
    "/products/vk-pdf/matt/emaspen-beige.webp",
  ].forEach((p) => keep.add(p));

  return keep;
}

function listPublicFiles() {
  const files = [];
  function walk(dir, rel = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, relPath);
      } else {
        files.push({ full, rel: `/${relPath.replace(/\\/g, "/")}` });
      }
    }
  }
  if (fs.existsSync(publicDir)) walk(publicDir);
  return files;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirs(path.join(dir, entry.name));
  }
  if (dir !== publicDir && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

const keep = loadKeepSet();
const allFiles = listPublicFiles();
const toDelete = [];
const kept = [];

for (const { full, rel } of allFiles) {
  const top = rel.split("/").filter(Boolean)[0];
  const isRootSvg = !rel.includes("/", 1) && KEEP_ROOT_FILES.has(rel.slice(1));
  const isGitkeep = rel.endsWith(".gitkeep");

  if (isRootSvg || isGitkeep) {
    kept.push(rel);
    continue;
  }

  if (keep.has(rel)) {
    kept.push(rel);
    continue;
  }

  // Delete old product lines, pdf previews, and unused images
  if (
    rel.startsWith("/products/") ||
    rel.startsWith("/_pdf-preview/") ||
    rel.startsWith("/images/products/")
  ) {
    toDelete.push(full);
  }
}

console.log(`Keep set: ${keep.size} referenced paths`);
console.log(`Deleting ${toDelete.length} unreferenced files...`);

for (const file of toDelete) {
  fs.unlinkSync(file);
}

// Remove emptied directories under products, _pdf-preview, images/products
for (const sub of ["products", "_pdf-preview", "images/products"]) {
  removeEmptyDirs(path.join(publicDir, ...sub.split("/")));
}

const remaining = listPublicFiles().filter(
  (f) => !f.rel.endsWith(".gitkeep") && !KEEP_ROOT_FILES.has(f.rel.slice(1))
);
console.log(`Done. ${kept.length} kept, ${toDelete.length} deleted.`);
console.log(`Remaining asset files: ${remaining.length}`);
remaining.slice(0, 20).forEach((f) => console.log(" ", f.rel));
if (remaining.length > 20) console.log(`  ... and ${remaining.length - 20} more`);
