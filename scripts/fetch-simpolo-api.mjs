import https from "https";
import fs from "fs";
import path from "path";

const BASE = "https://admin.simpolo.com/api/web/";
const TOKEN =
  "Bearer 1oOMRtthzTyn79SN8DQ1WfBBghpPkRm7ixuddD1i21d90e81";
const S3 = "https://simpolo-web.s3.ap-south-1.amazonaws.com/";

function request(urlPath) {
  return new Promise((resolve, reject) => {
    https
      .get(
        BASE + urlPath,
        {
          headers: {
            Authorization: TOKEN,
            Accept: "application/json",
            Origin: "https://www.simpolo.com",
            Referer: "https://www.simpolo.com/",
            "User-Agent": "Mozilla/5.0",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, json: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode, json: null });
            }
          });
        }
      )
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function abs(img) {
  if (!img) return "";
  if (String(img).startsWith("http")) return img;
  return S3 + String(img).replace(/^\//, "");
}

function splitCsv(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalize(d) {
  const sizes = splitCsv(d.size);
  const thicknesses = splitCsv(d.thickness);
  const tilesPerBox = splitCsv(d.tiles_per_box);
  const areaPerBox = splitCsv(d.area_per_box);

  let packing = Array.isArray(d.packagings)
    ? d.packagings.map((row) => ({
        size: row.size || "",
        thickness: row.thickness || "",
        tilesPerBox: Number(row.tiles_per_box) || null,
        coverageSqFt: Number(row.area_per_box) || null,
      }))
    : [];

  if (!packing.length && sizes.length) {
    packing = sizes.map((size, i) => ({
      size,
      thickness: thicknesses[i] || thicknesses[0] || "",
      tilesPerBox: Number(tilesPerBox[i]) || null,
      coverageSqFt: Number(areaPerBox[i]) || null,
    }));
  }

  const gallery = []
    .concat(d.gallery || [])
    .concat(d.images || [])
    .map((g) => abs(typeof g === "string" ? g : g.image))
    .filter(Boolean);

  const image = abs(d.inner_image) || gallery[0] || "";

  const features = Array.isArray(d.features)
    ? d.features.map((f) => f.name || f).filter(Boolean)
    : [];

  const collection = d.collection_name || "Simpolo";
  const collectionSlug = d.collection_slug || slugify(collection);

  return {
    slug: d.slug,
    name: d.product_name || d.slug,
    productCode: d.product_code || "",
    brand: "Simpolo",
    category: collectionSlug,
    collection,
    collectionSlug,
    description: d.description || "",
    applicationDescription: d.application_description || "",
    application: splitCsv(d.application),
    colors: splitCsv(d.color),
    finishes: splitCsv(d.finish),
    lookFeel: d.look_n_feel || "",
    pattern: d.pattern || "",
    indoorOutdoor: d.indoor_outdoor || "",
    bodyType: d.type_of_body || "",
    surface: d.surface || "",
    sizes,
    thicknesses,
    packing,
    features,
    image,
    images: [...new Set([image, ...gallery].filter(Boolean))],
    finish: splitCsv(d.finish)[0] || "",
    size: sizes[0] || "",
    availability: "In Stock",
    featured: String(d.label || "").toLowerCase() === "new",
    label: d.label || "",
    viewLink: d.view_link || "",
    sourceUrl: `https://www.simpolo.com/product-detail/${d.slug}`,
  };
}

async function main() {
  const outDir = path.join(process.cwd(), "scripts", "output");
  const contentDir = path.join(process.cwd(), "content");
  fs.mkdirSync(outDir, { recursive: true });

  const checkpointPath = path.join(outDir, "fetch-checkpoint.json");
  const args = process.argv.slice(2);
  const fresh = args.includes("--fresh");
  const limitArg = args.find((a) => /^\d+$/.test(a));
  const limit = limitArg ? Number(limitArg) : Infinity;

  console.log("Listing products...");
  const listRes = await request("tiles/products/all-products");
  const slugs = (listRes.json?.data?.products || [])
    .map((p) => p.slug)
    .filter(Boolean);
  console.log("Total slugs:", slugs.length);

  let products = [];
  let start = 0;
  if (fs.existsSync(checkpointPath) && !fresh) {
    const cp = JSON.parse(fs.readFileSync(checkpointPath, "utf8"));
    products = cp.products || [];
    start = products.length;
    console.log("Resuming from", start);
  } else if (fresh && fs.existsSync(checkpointPath)) {
    fs.unlinkSync(checkpointPath);
    console.log("Fresh start — checkpoint cleared");
  }

  const targets = slugs.slice(0, Number.isFinite(limit) ? limit : slugs.length);
  const errors = [];

  for (let i = start; i < targets.length; i++) {
    const slug = targets[i];
    try {
      const res = await request(
        `tiles/products/details?slug=${encodeURIComponent(slug)}`
      );
      if (res.status === 200 && res.json?.data) {
        products.push(normalize(res.json.data));
      } else {
        errors.push({ slug, status: res.status });
      }
    } catch (e) {
      errors.push({ slug, error: e.message });
    }

    if ((i + 1) % 20 === 0 || i === targets.length - 1) {
      fs.writeFileSync(
        checkpointPath,
        JSON.stringify({ products, errors, at: i + 1 }, null, 2)
      );
      console.log(`Fetched ${i + 1}/${targets.length}`);
    }
    await sleep(80);
  }

  // Build categories from collections
  const byCollection = new Map();
  for (const p of products) {
    const key = p.collectionSlug;
    if (!byCollection.has(key)) {
      byCollection.set(key, {
        slug: key,
        name: p.collection,
        blurb: `Simpolo ${p.collection} collection`,
        image: p.image,
        count: 0,
      });
    }
    const c = byCollection.get(key);
    c.count += 1;
    if (!c.image && p.image) c.image = p.image;
  }

  const categories = [...byCollection.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const payload = {
    scrapedAt: new Date().toISOString(),
    count: products.length,
    categories,
    products,
    errors,
  };

  fs.writeFileSync(
    path.join(outDir, "simpolo-catalog.json"),
    JSON.stringify(payload, null, 2)
  );
  fs.writeFileSync(
    path.join(contentDir, "simpolo-catalog.json"),
    JSON.stringify(payload, null, 2)
  );

  console.log(
    "Done. Products:",
    products.length,
    "Collections:",
    categories.length,
    "Errors:",
    errors.length
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
