import https from "https";
import fs from "fs";
import path from "path";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "*/*",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () =>
            resolve({ status: res.statusCode, headers: res.headers, body: data })
          );
        }
      )
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function textBetween(html, start, end) {
  const i = html.indexOf(start);
  if (i < 0) return "";
  const j = html.indexOf(end, i + start.length);
  if (j < 0) return html.slice(i + start.length);
  return html.slice(i + start.length, j);
}

function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseProduct(html, url) {
  const slug = url.split("/product-detail/")[1]?.replace(/\/$/, "") || "";
  const titleMatch =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    html.match(/property="og:title"\s+content="([^"]+)"/i);
  const name = titleMatch
    ? stripTags(titleMatch[1]).replace(/\s*\|.*$/, "").trim()
    : slug;

  const descMatch =
    html.match(/Short Description:[\s\S]*?<[^>]+>([\s\S]*?)(?:Collection\s*:|<\/)/i) ||
    html.match(/property="og:description"\s+content="([^"]+)"/i);
  const description = descMatch ? stripTags(descMatch[1]) : "";

  const collectionMatch = html.match(/Collection\s*:\s*<\/?[^>]*>?\s*([^<\n]+)/i);
  const collection = collectionMatch ? stripTags(collectionMatch[1]) : "";

  const appMatch = html.match(/Application:\s*([^<\n]+)/i);
  const application = appMatch
    ? stripTags(appMatch[1])
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const colorsSection = textBetween(html, ">Colors<", ">Finishes<");
  const colors = [...colorsSection.matchAll(/>([A-Za-z][A-Za-z\s/-]{1,30})</g)]
    .map((m) => m[1].trim())
    .filter((c) => !/^(Colors|Close|Apply)$/i.test(c));

  const finishesSection = textBetween(html, ">Finishes<", ">Look");
  const finishes = [...finishesSection.matchAll(/>([A-Za-z][A-Za-z\s+/-]{1,30})</g)]
    .map((m) => m[1].trim())
    .filter((c) => !/^(Finishes|Close|Apply)$/i.test(c));

  // Fallback simple extraction from stripped text
  const plain = stripTags(html);
  let lookFeel = "";
  const lookMatch = plain.match(/Look\s*&\s*Feel\s+([A-Za-z][A-Za-z\s/-]+?)(?:Features|Simpolo|Packing|$)/i);
  if (lookMatch) lookFeel = lookMatch[1].trim().split(/\s{2,}/)[0];

  let features = "";
  const featMatch = plain.match(/Features\s+([\s\S]*?)(?:Simpolo Ultimate Guide|Packing Details|$)/i);
  if (featMatch) features = featMatch[1].trim().slice(0, 500);

  // sizes from packing or sizes section
  const sizes = [];
  const sizeMatches = [...html.matchAll(/(\d{2,4}\s*[x×]\s*\d{2,4})/gi)].map((m) =>
    m[1].replace(/\s/g, "").toLowerCase().replace("×", "x")
  );
  for (const s of sizeMatches) {
    if (!sizes.includes(s) && /^\d+x\d+$/.test(s)) sizes.push(s);
  }

  // packing table rows
  const packing = [];
  const rowRe =
    /(ALCHIMIA|[\w\s-]+)?\s*(\d{2,4}x\d{2,4})\s+(\d+\s*mm)\s+(\d+)\s*(?:pcs\.?)?\s+([\d.]+)\s*(?:sq\s*ft)?/gi;
  const packingText = plain.match(/Packing Details[\s\S]*?(?:Related Products|$)/i)?.[0] || plain;
  let m;
  while ((m = rowRe.exec(packingText))) {
    packing.push({
      size: m[2],
      thickness: m[3].replace(/\s/g, ""),
      tilesPerBox: Number(m[4]),
      coverageSqFt: Number(m[5]),
    });
  }

  // unique packing by size
  const packingUnique = [];
  const seen = new Set();
  for (const p of packing) {
    if (seen.has(p.size)) continue;
    seen.add(p.size);
    packingUnique.push(p);
  }

  const ogImage =
    (html.match(/property="og:image"\s+content="([^"]+)"/i) || [])[1] ||
    (html.match(/content="([^"]+)"\s+property="og:image"/i) || [])[1] ||
    "";

  const images = [...html.matchAll(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi)]
    .map((x) => x[0])
    .filter((u) => /product|tile|simpolo|cdn|media|upload/i.test(u))
    .slice(0, 8);

  return {
    slug,
    name: name.toUpperCase().includes("ALCHIMIA") || name.length > 2 ? name : slug,
    url,
    collection: collection || "Simpolo",
    description,
    application,
    colors: [...new Set(colors)].slice(0, 10),
    finishes: [...new Set(finishes)].slice(0, 10),
    lookFeel,
    features,
    sizes: sizes.slice(0, 12),
    packing: packingUnique,
    image: ogImage || images[0] || "",
    images: [...new Set([ogImage, ...images].filter(Boolean))].slice(0, 6),
    brand: "Simpolo",
    availability: "In Stock",
  };
}

async function discoverApiFromPage() {
  const { body: html } = await get("https://www.simpolo.com/tiles/products");
  const urls = new Set();
  for (const m of html.matchAll(/https?:\/\/[a-zA-Z0-9._/-]+/g)) {
    const u = m[0];
    if (/admin\.simpolo|api\./i.test(u)) urls.add(u.replace(/[",'].*$/, ""));
  }
  for (const m of html.matchAll(/["'](\/?api\/[^"']+)["']/g)) urls.add(m[1]);
  console.log("Candidate API refs:", [...urls].slice(0, 40));

  // Next chunks often contain API base
  const chunks = [...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]);
  console.log("Chunks:", chunks.length);
  for (const chunk of chunks.slice(0, 15)) {
    try {
      const { body } = await get("https://www.simpolo.com" + chunk);
      const hits = [
        ...body.matchAll(/https?:\/\/admin\.simpolo\.com[^"'\\\s]*/g),
        ...body.matchAll(/["'](\/api\/[^"']+)["']/g),
        ...body.matchAll(/product[_-]?detail|getProduct|productList|tileProduct/gi),
      ];
      if (hits.length) {
        console.log("Chunk", chunk, "hits", hits.slice(0, 20).map((h) => h[0] || h));
      }
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  const mode = process.argv[2] || "sitemap";

  if (mode === "discover") {
    await discoverApiFromPage();
    return;
  }

  console.log("Fetching sitemap...");
  const { body: sitemap } = await get("https://www.simpolo.com/sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let productUrls = locs.filter((u) => u.includes("/product-detail/"));
  console.log("Sitemap product URLs:", productUrls.length);

  // Also pull collection pages for more product links
  const collectionUrls = locs.filter((u) => u.includes("/tiles/collection/"));
  console.log("Collections:", collectionUrls.length);

  for (const cu of collectionUrls.slice(0, 80)) {
    try {
      const { body } = await get(cu);
      const found = [...body.matchAll(/\/product-detail\/([a-z0-9-]+)/gi)].map(
        (m) => `https://www.simpolo.com/product-detail/${m[1].toLowerCase()}`
      );
      productUrls.push(...found);
      await sleep(200);
    } catch (e) {
      console.warn("collection fail", cu, e.message);
    }
  }

  productUrls = [...new Set(productUrls.map((u) => u.replace(/\/$/, "").toLowerCase()))];
  console.log("Total unique product URLs:", productUrls.length);

  // Cap for practical catalog size unless ALL
  const limit = process.argv[3] ? Number(process.argv[3]) : productUrls.length;
  const targets = productUrls.slice(0, limit);
  console.log("Scraping", targets.length, "products...");

  const products = [];
  const errors = [];
  for (let i = 0; i < targets.length; i++) {
    const url = targets[i];
    try {
      const { status, body } = await get(url);
      if (status !== 200) {
        errors.push({ url, status });
        continue;
      }
      const p = parseProduct(body, url);
      products.push(p);
      if ((i + 1) % 10 === 0 || i === targets.length - 1) {
        console.log(`Scraped ${i + 1}/${targets.length}: ${p.name}`);
      }
      await sleep(250);
    } catch (e) {
      errors.push({ url, error: e.message });
    }
  }

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "simpolo-products.json");
  fs.writeFileSync(outPath, JSON.stringify({ scrapedAt: new Date().toISOString(), count: products.length, products, errors }, null, 2));
  console.log("Wrote", outPath, "products:", products.length, "errors:", errors.length);

  // collections summary
  const byCollection = {};
  for (const p of products) {
    const c = p.collection || "Unknown";
    byCollection[c] = (byCollection[c] || 0) + 1;
  }
  console.log("By collection:", byCollection);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
