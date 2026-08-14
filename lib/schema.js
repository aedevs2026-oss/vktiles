import { business, seo as siteSeo, faqs, businessHours, services, aeo } from "@/content/data";

function openingHoursSpecification() {
  return businessHours
    .map((entry) => {
      const isSunday = entry.day.toLowerCase().includes("sunday");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: isSunday
          ? "Sunday"
          : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: isSunday ? undefined : "09:00",
        closes: isSunday ? undefined : "20:00",
      };
    })
    .filter((spec) => spec.opens);
}

function areaServedSchema() {
  return business.serviceAreas.map((area) => ({
    "@type": "Place",
    name: `${area}, Tamil Nadu, India`,
  }));
}

export function generateProductJsonLd(product) {
  if (!product) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : [product.image],
    brand: { "@type": "Brand", name: product.brand || business.name },
    category: product.category,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      seller: { "@id": `${siteSeo.siteUrl}/#localbusiness` },
      areaServed: areaServedSchema(),
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
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "Store"],
    "@id": `${siteSeo.siteUrl}/#localbusiness`,
    name: business.name,
    alternateName: business.alternateName,
    slogan: business.tagline,
    description: business.description,
    url: siteSeo.siteUrl,
    telephone: business.phone,
    email: business.email,
    image: `${siteSeo.siteUrl}${siteSeo.ogImage}`,
    logo: `${siteSeo.siteUrl}/logo.png`,
    priceRange: business.priceRange,
    foundingDate: String(business.founded),
    keywords: siteSeo.keywords.slice(0, 20).join(", "),
    paymentAccepted: "Cash, UPI, Bank Transfer",
    currenciesAccepted: "INR",
    hasMap: business.mapLink,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    areaServed: areaServedSchema(),
    knowsAbout: business.knowsAbout.map((topic) => ({
      "@type": "Thing",
      name: topic,
    })),
    openingHoursSpecification: openingHoursSpecification(),
    sameAs: [business.whatsapp, business.mapLink, ...business.socialProfiles.filter(Boolean)],
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        provider: { "@id": `${siteSeo.siteUrl}/#localbusiness` },
        areaServed: areaServedSchema(),
      },
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteSeo.siteUrl}/#organization`,
    name: business.name,
    alternateName: business.alternateName,
    url: siteSeo.siteUrl,
    logo: `${siteSeo.siteUrl}/logo.png`,
    description: business.description,
    email: business.email,
    telephone: business.phone,
    foundingDate: String(business.founded),
    slogan: business.tagline,
    areaServed: business.serviceAreas,
    knowsAbout: business.knowsAbout,
    sameAs: [business.whatsapp, business.mapLink, ...business.socialProfiles.filter(Boolean)],
  };
}

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteSeo.siteUrl}/#website`,
    name: business.name,
    url: siteSeo.siteUrl,
    description: siteSeo.defaultDescription,
    inLanguage: "en-IN",
    publisher: { "@id": `${siteSeo.siteUrl}/#organization` },
    about: { "@id": `${siteSeo.siteUrl}/#localbusiness` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteSeo.siteUrl}/products?category={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateFAQPageJsonLd(items = faqs) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteSeo.siteUrl}/faq#faqpage`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function generateSpeakableJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteSeo.siteUrl}/#homepage`,
    name: siteSeo.defaultTitle,
    description: siteSeo.defaultDescription,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable]", ".aeo-summary"],
    },
    about: { "@id": `${siteSeo.siteUrl}/#localbusiness` },
  };
}

export function generateAeoEntityJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    "@id": `${siteSeo.siteUrl}/#entity`,
    name: aeo.entityName,
    description: aeo.citationSummary,
    additionalProperty: aeo.quickFacts.map((fact) => ({
      "@type": "PropertyValue",
      name: fact.label,
      value: fact.value,
    })),
  };
}

export function generateGlobalJsonLd() {
  return [
    generateOrganizationJsonLd(),
    generateLocalBusinessJsonLd(),
    generateWebSiteJsonLd(),
    generateFAQPageJsonLd(),
    generateSpeakableJsonLd(),
    generateAeoEntityJsonLd(),
  ].filter(Boolean);
}

export function generateJsonLd(...schemas) {
  return schemas.filter(Boolean);
}
