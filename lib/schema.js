import { business, seo as siteSeo } from "@/content/data";

export function generateProductJsonLd(product) {
  if (!product) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : [product.image],
    brand: { "@type": "Brand", name: product.brand || "VK Tiles & Granites" },
    category: product.category,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: business.name },
    },
  };
}

export function generateBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `${siteSeo.siteUrl}${item.href}` : undefined,
    })),
  };
}

export function generateLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    telephone: business.phone,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressCountry: "IN",
    },
    url: siteSeo.siteUrl,
  };
}

export function generateJsonLd(...schemas) {
  return schemas.filter(Boolean);
}
