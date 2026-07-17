import { business } from "@/content/data";
import { CATEGORY_LABELS } from "@/lib/catalog-filters";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function packingRows(product) {
  if (!product.packing?.length) return "";
  const rows = product.packing
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.size)}</td>
        <td>${escapeHtml(row.thickness)}</td>
        <td>${escapeHtml(row.tilesPerBox)}</td>
        <td>${escapeHtml(row.coverage)}</td>
        <td>${escapeHtml(row.weight)}</td>
      </tr>`
    )
    .join("");
  return `
    <h2>Packing details</h2>
    <table>
      <thead>
        <tr>
          <th>Size</th>
          <th>Thickness</th>
          <th>Tiles / box</th>
          <th>Coverage</th>
          <th>Weight</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function listSection(title, items) {
  if (!items?.length) return "";
  return `
    <h2>${escapeHtml(title)}</h2>
    <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function documentShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, Segoe UI, sans-serif; color: #0b1f3a; max-width: 820px; margin: 2rem auto; padding: 0 1.25rem; line-height: 1.5; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.1rem; margin-top: 1.75rem; border-bottom: 1px solid #dbeafe; padding-bottom: 0.35rem; }
    .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .hero img { max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 0.5rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.65rem; text-align: left; }
    th { background: #f0f9ff; }
    ul { padding-left: 1.25rem; }
    .footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #475569; }
    @media print { body { margin: 0.5in; } }
  </style>
</head>
<body>
  ${body}
  <div class="footer">
    <strong>${escapeHtml(business.name)}</strong><br />
    ${escapeHtml(business.address)} · ${escapeHtml(business.phone)} · ${escapeHtml(business.email)}
  </div>
</body>
</html>`;
}

export function buildProductCatalogHtml(product, pageUrl = "") {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const image = product.imageMedium || product.image;
  const finishes = product.finishes?.join(", ") || product.finish;

  const body = `
    <p class="meta">${escapeHtml(business.name)} · Product catalogue sheet</p>
    <h1>${escapeHtml(product.name)}</h1>
    <p class="meta">${escapeHtml(categoryLabel)} · ${escapeHtml(product.collection || "")}</p>
    ${image ? `<div class="hero"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" /></div>` : ""}
    <p>${escapeHtml(product.description)}</p>
    <h2>Overview</h2>
    <table>
      <tbody>
        <tr><th>Category</th><td>${escapeHtml(categoryLabel)}</td></tr>
        <tr><th>Size</th><td>${escapeHtml(product.size)}</td></tr>
        <tr><th>Finish</th><td>${escapeHtml(finishes)}</td></tr>
        <tr><th>Surface</th><td>${escapeHtml(product.surface)}</td></tr>
        <tr><th>Pattern</th><td>${escapeHtml(product.pattern)}</td></tr>
        <tr><th>Thickness</th><td>${escapeHtml(product.thickness)}</td></tr>
        <tr><th>Availability</th><td>${escapeHtml(product.availability || "Enquire")}</td></tr>
        ${pageUrl ? `<tr><th>Web</th><td>${escapeHtml(pageUrl)}</td></tr>` : ""}
      </tbody>
    </table>
    ${listSection("Features", product.features)}
    ${listSection("Applications", product.applications)}
    ${packingRows(product)}
  `;

  return documentShell(`${product.name} | ${business.name}`, body);
}

export function buildProductSpecificationHtml(product, pageUrl = "") {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const finishes = product.finishes?.join(", ") || product.finish;

  const body = `
    <p class="meta">${escapeHtml(business.name)} · Technical specification</p>
    <h1>${escapeHtml(product.name)}</h1>
    <p class="meta">${escapeHtml(categoryLabel)} · ${escapeHtml(product.size)} · ${escapeHtml(finishes)}</p>
    <h2>Technical data</h2>
    <table>
      <tbody>
        <tr><th>Product</th><td>${escapeHtml(product.name)}</td></tr>
        <tr><th>Collection</th><td>${escapeHtml(product.collection)}</td></tr>
        <tr><th>Category</th><td>${escapeHtml(categoryLabel)}</td></tr>
        <tr><th>Size</th><td>${escapeHtml(product.size)}</td></tr>
        <tr><th>Finish</th><td>${escapeHtml(finishes)}</td></tr>
        <tr><th>Surface</th><td>${escapeHtml(product.surface)}</td></tr>
        <tr><th>Pattern</th><td>${escapeHtml(product.pattern)}</td></tr>
        <tr><th>Thickness</th><td>${escapeHtml(product.thickness)}</td></tr>
      </tbody>
    </table>
    ${listSection("Performance & features", product.features)}
    ${packingRows(product)}
    ${pageUrl ? `<p class="meta">Reference: ${escapeHtml(pageUrl)}</p>` : ""}
  `;

  return documentShell(`${product.name} specification | ${business.name}`, body);
}

export function buildShareText(product, pageUrl) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  return `${product.name} — ${product.size}, ${product.finish || ""} (${categoryLabel})\n${business.name}\n${pageUrl}`;
}

export function downloadTextFile(filename, content, mimeType = "text/html;charset=utf-8") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadProductCatalog(product) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const html = buildProductCatalogHtml(product, pageUrl);
  const safeSlug = product.slug || "product";
  downloadTextFile(`vk-tiles-${safeSlug}-catalog.html`, html);
}

export function downloadProductSpecification(product) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const html = buildProductSpecificationHtml(product, pageUrl);
  const safeSlug = product.slug || "product";
  downloadTextFile(`vk-tiles-${safeSlug}-specification.html`, html);
}
