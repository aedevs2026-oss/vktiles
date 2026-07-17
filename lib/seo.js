import { seo as siteSeo, business } from "@/content/data";

export function generatePageMetadata({ title, description, keywords, path, image, type = "website" }) {
  const pageTitle = title ? `${title} | ${business.name}` : siteSeo.defaultTitle;
  const pageDescription = description || siteSeo.defaultDescription;
  const url = path ? `${siteSeo.siteUrl}${path}` : siteSeo.siteUrl;
  const ogImage = image || siteSeo.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords || siteSeo.keywords,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: business.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || business.name }],
      locale: "en_IN",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export function generateProductMetadata(product) {
  if (!product) return generatePageMetadata({});
  const seo = product.seo || {};
  return generatePageMetadata({
    title: seo.title || product.name,
    description: seo.description || product.description,
    keywords: seo.keywords,
    path: `/products/${product.slug}`,
    image: product.image,
    type: "website",
  });
}
