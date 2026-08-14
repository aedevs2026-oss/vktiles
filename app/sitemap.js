import { seo, pageSeo } from "@/content/data";
import { getProducts } from "@/lib/products";

export default function sitemap() {
  const base = seo.siteUrl;
  const now = new Date();

  const seen = new Set();
  const staticPages = [{ path: "", priority: 1.0, changeFrequency: "weekly" }];

  for (const page of Object.values(pageSeo)) {
    const path = page.path === "/" ? "" : page.path;
    if (seen.has(path)) continue;
    seen.add(path);
    staticPages.push({
      path,
      priority: page.path === "/products" ? 0.95 : 0.8,
      changeFrequency: "weekly",
    });
  }

  const productPages = getProducts().slice(0, 5000).map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...productPages,
  ];
}
