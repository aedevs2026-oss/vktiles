import https from "https";

function get(url, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        Origin: "https://www.simpolo.com",
        Referer: "https://www.simpolo.com/",
        ...(body
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
          : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const jsUrl =
    "https://www.simpolo.com/_next/static/chunks/pages/_app-f7a80d4bde646de0.js";
  const { body: js } = await get(jsUrl);
  const idx = js.indexOf("admin.simpolo.com/api/web");
  console.log("context:\n", js.slice(Math.max(0, idx - 300), idx + 1200));

  const paths = [...new Set(js.match(/api\/web\/[a-zA-Z0-9_/-]+/g) || [])];
  console.log("\npaths from bundle:", paths);

  // Try POST to likely endpoints
  const candidates = [
    "https://admin.simpolo.com/api/web/tile-product/list",
    "https://admin.simpolo.com/api/web/tile_product/list",
    "https://admin.simpolo.com/api/web/tileProduct/list",
    "https://admin.simpolo.com/api/web/product/detail",
    "https://admin.simpolo.com/api/web/product_detail",
    "https://admin.simpolo.com/api/web/productDetail",
    "https://admin.simpolo.com/api/web/getProductDetail",
    "https://admin.simpolo.com/api/web/get-product-detail",
    "https://admin.simpolo.com/api/web/getProductList",
    "https://admin.simpolo.com/api/web/get-product-list",
    "https://admin.simpolo.com/api/web/filterProduct",
    "https://admin.simpolo.com/api/web/filter-product",
    "https://admin.simpolo.com/api/web/tile/list",
    "https://admin.simpolo.com/api/web/tiles/list",
    "https://admin.simpolo.com/api/web/collection/list",
    "https://admin.simpolo.com/api/web/getCollection",
    "https://admin.simpolo.com/api/web/get-collection",
    "https://admin.simpolo.com/api/web/master/list",
    "https://admin.simpolo.com/api/web/masters",
  ];

  // Also extract quoted path fragments near TileProduct
  for (const key of ["TileProduct", "product_detail", "productDetail", "getProduct"]) {
    let i = 0;
    let from = 0;
    while ((i = js.indexOf(key, from)) >= 0 && from < js.length) {
      console.log(`\nAround ${key} @${i}:`, js.slice(i - 80, i + 200).replace(/\n/g, " "));
      from = i + key.length;
      if (from > i + 5000) break;
      // only first few
      if (from - js.indexOf(key) > 3000) break;
    }
  }

  const payloads = [
    {},
    { page: 1, limit: 20 },
    { slug: "alchimia-pearl" },
    { product_slug: "alchimia-pearl" },
    { url_slug: "alchimia-pearl" },
  ];

  for (const url of candidates) {
    for (const method of ["GET", "POST"]) {
      try {
        const body = method === "POST" ? JSON.stringify(payloads[1]) : null;
        const r = await get(url + (method === "GET" ? "?page=1&limit=5" : ""), method, body);
        if (r.status !== 404) {
          console.log("\nHIT", method, r.status, url);
          console.log(r.body.slice(0, 500));
        }
      } catch (e) {
        console.log("err", url, e.message);
      }
    }
  }
}

main().catch(console.error);
