import { seo as siteSeo, business, aeo } from "@/content/data";

function geoMetadata() {
  const { latitude, longitude } = business.geo;
  const placename = `${business.city}, ${business.district}, ${business.state}, India`;

  return {
    "geo.region": siteSeo.region,
    "geo.placename": placename,
    "geo.position": `${latitude};${longitude}`,
    ICBM: `${latitude}, ${longitude}`,
    "DC.title": business.name,
    "DC.creator": business.name,
    "DC.subject": siteSeo.keywords.slice(0, 12).join(", "),
    "DC.coverage": "Tamil Nadu, India",
    "content-language": siteSeo.locale,
    coverage: "Worldwide",
    distribution: "Global",
    rating: "General",
  };
}

function aeoMetadata() {
  return {
    "business:contact_data:locality": business.city,
    "business:contact_data:region": business.state,
    "business:contact_data:postal_code": business.postalCode,
    "business:contact_data:country_name": "India",
    "business:contact_data:phone_number": business.phone,
    "business:contact_data:website": siteSeo.siteUrl,
    "og:locality": business.city,
    "og:region": business.state,
    "og:country-name": "India",
    "og:postal-code": business.postalCode,
    "og:street-address": business.address,
    "og:phone_number": business.phone,
    "og:email": business.email,
    "og:latitude": String(business.geo.latitude),
    "og:longitude": String(business.geo.longitude),
    "ai-content-declaration": aeo.citationSummary,
  };
}

function buildMetadataExtras() {
  return {
    ...geoMetadata(),
    ...aeoMetadata(),
  };
}

export function generateRootMetadata() {
  return {
    metadataBase: new URL(siteSeo.siteUrl),
    title: {
      default: siteSeo.defaultTitle,
      template: siteSeo.titleTemplate,
    },
    description: siteSeo.defaultDescription,
    keywords: siteSeo.keywords,
    applicationName: business.name,
    authors: [{ name: business.name, url: siteSeo.siteUrl }],
    creator: business.name,
    publisher: business.name,
    category: "Home & Construction",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
    openGraph: {
      title: siteSeo.defaultTitle,
      description: siteSeo.defaultDescription,
      url: siteSeo.siteUrl,
      siteName: business.name,
      images: [{ url: siteSeo.ogImage, width: 1200, height: 630, alt: business.name }],
      locale: siteSeo.locale,
      type: "website",
      countryName: "India",
    },
    twitter: {
      card: "summary_large_image",
      title: siteSeo.defaultTitle,
      description: siteSeo.defaultDescription,
      images: [siteSeo.ogImage],
    },
    alternates: {
      canonical: siteSeo.siteUrl,
      languages: {
        "en-IN": siteSeo.siteUrl,
      },
    },
    other: buildMetadataExtras(),
  };
}

export function generatePageMetadata({ title, description, keywords, path, image, type = "website" }) {
  const pageTitle = title || siteSeo.defaultTitle;
  const pageDescription = description || siteSeo.defaultDescription;
  const url = path ? `${siteSeo.siteUrl}${path}` : siteSeo.siteUrl;
  const ogImage = image || siteSeo.ogImage;
  const fullTitle = title ? `${title} | ${business.name}` : siteSeo.defaultTitle;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords || siteSeo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: pageDescription,
      url,
      siteName: business.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || business.name }],
      locale: siteSeo.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
      images: [ogImage],
    },
    other: buildMetadataExtras(),
  };
}

export function generateProductMetadata(product) {
  if (!product) return generatePageMetadata({});
  const productSeo = product.seo || {};
  const locationSuffix =
    " — wholesale tiles & granites in Dharmapuri, Salem, Kadathur, Bommidi and Tamil Nadu";
  return generatePageMetadata({
    title: productSeo.title || `${product.name} | Wholesale Tile`,
    description:
      productSeo.description ||
      `${product.description || product.name}${locationSuffix}. Best wholesale rates at VK Tiles & Granites, Bommidi.`,
    keywords: productSeo.keywords || [
      product.name,
      product.category,
      product.series,
      "wholesale tiles Tamil Nadu",
      "tiles Dharmapuri",
      "tiles Salem",
      "tiles Bommidi",
      "VK Tiles Granites",
    ].filter(Boolean),
    path: `/products/${product.slug}`,
    image: product.image,
    type: "website",
  });
}
