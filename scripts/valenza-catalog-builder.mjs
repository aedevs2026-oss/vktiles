/**
 * Builds valenza-catalog.json from seed data + optional live scrape overrides
 */
const BASE_IMG = "https://www.valenzaceramic.com/uploads/products";

const PACKING_DEFAULTS = {
  "300x450 MM": { thickness: "7.5 MM", tilesPerBox: 6, coverage: "0.81 SQM", weight: "16 KG" },
  "300x600 MM": { thickness: "9 MM", tilesPerBox: 5, coverage: "0.90 SQM", weight: "18 KG" },
  "600x600 MM": { thickness: "9 MM", tilesPerBox: 4, coverage: "1.44 SQM", weight: "28 KG" },
  "600x1200 MM": { thickness: "9 MM", tilesPerBox: 2, coverage: "1.44 SQM", weight: "30 KG" },
  "800x1600 MM": { thickness: "9 MM", tilesPerBox: 2, coverage: "2.56 SQM", weight: "42 KG" },
  "1200x1800 MM": { thickness: "9 MM", tilesPerBox: 1, coverage: "2.16 SQM", weight: "38 KG" },
  "1200x1200 MM": { thickness: "9 MM", tilesPerBox: 2, coverage: "2.88 SQM", weight: "42 KG" },
  "300x300 MM": { thickness: "10 MM", tilesPerBox: 9, coverage: "0.81 SQM", weight: "22 KG" },
  "400x400 MM": { thickness: "12 MM", tilesPerBox: 6, coverage: "0.96 SQM", weight: "24 KG" },
  "500x500 MM": { thickness: "12 MM", tilesPerBox: 4, coverage: "1.00 SQM", weight: "26 KG" },
  "200x900 MM": { thickness: "9 MM", tilesPerBox: 8, coverage: "1.44 SQM", weight: "22 KG" },
  "200x1200 MM": { thickness: "9 MM", tilesPerBox: 6, coverage: "1.44 SQM", weight: "26 KG" },
};

const FEATURES = [
  "Low Water Absorption",
  "High Breaking Strength",
  "Frost Resistant",
  "Stain Resistant",
  "Easy Maintenance",
  "ISO 9001:2015 Certified",
];

const APPLICATIONS = {
  "gvt-pgvt": ["Living Room", "Bedroom", "Commercial Spaces", "Hotels", "Office"],
  "wall-tiles": ["Bathroom", "Kitchen", "Living Room", "Bedroom"],
  "parking-tiles": ["Parking Areas", "Driveways", "Commercial Outdoor"],
  "wooden-strip": ["Living Room", "Bedroom", "Commercial Spaces"],
  "elevation-tiles": ["Building Facade", "Exterior Walls", "Commercial Elevation"],
  "elevation-natural-stones": ["Building Facade", "Premium Elevation", "Landscape"],
};

const SEED_GROUPS = [
  {
    category: "gvt-pgvt",
    subcategory: "600x600",
    size: "600x600 MM",
    finish: "Glossy",
    surface: "Polished",
    pattern: "Random",
    collection: "GVT Glossy Series",
    names: [
      "ALTERO SILVER", "ATLANTIC WHITE", "BARDIGO LATTE", "BARDIGO NATURAL", "DALATI TAN",
      "ANLAYA GREY", "ANTI SKY", "ARENA BEIGE", "ARENA WHITE", "BIANCO STONE",
      "DOBLIN CREMA", "FOG GREY", "FOG LIGHT GREY", "MIDAS CREMA", "ONYX WHITE",
      "REGAL CARARA", "ROSSO SILVER", "ZOLA WHITE",
    ],
  },
  {
    category: "gvt-pgvt",
    subcategory: "600x1200",
    size: "600x1200 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Random",
    collection: "GVT Matt Series",
    names: [
      "CEMENTO DARK GREY", "COCRETO CHAWK", "ESSENCE BEGIE", "MATTONE MEDIO",
      "OCTANE BEIGE", "PHANTOM BIANCO", "PIEDRA CALIDA", "VERA PIETRA MARRONE",
    ],
  },
  {
    category: "gvt-pgvt",
    subcategory: "600x1200",
    size: "600x1200 MM",
    finish: "Glossy",
    surface: "Polished",
    pattern: "Marble",
    collection: "GVT Glossy Series",
    names: [
      "ALLORE CALACATTA", "ANTALYA GREY", "BELDIA GOLD", "CENTURA GOLD", "CROWN STATUARIO",
      "DESPRO STATUARIO", "ICARUS GREY", "ISTORIA BEIGE", "NATHAN WHITE", "BAYONA SKY",
      "BELARUS AQUA", "CACTUS AQUA", "DOMLUR AQUA", "EMPORIO AQUA", "HAQUE PINE",
      "HAYAT GREEN", "LUNA GREEN", "ONYX NEOTH MANGO", "PIOCHE AQUA", "RUYA NATURAL",
      "SAREGA MULTY", "TALCHER GREEN", "WALDA BLUE",
    ],
  },
  {
    category: "gvt-pgvt",
    subcategory: "800x1600",
    size: "800x1600 MM",
    finish: "Glossy",
    surface: "Polished",
    pattern: "Marble",
    collection: "Large Format GVT",
    names: [
      "EMPIRE STATUARIO", "GOLDEN VEIN", "ONYX CAPOTEA", "NORWAY SERIES GREY",
      "NORWAY SERIES BROWN", "STATUARIO GOLD", "CALACATTA GOLD",
    ],
  },
  {
    category: "gvt-pgvt",
    subcategory: "1200x1800",
    size: "1200x1800 MM",
    finish: "High Gloss",
    surface: "High Gloss",
    pattern: "Marble",
    collection: "Slab Collection",
    names: ["SUPER WHITE SLAB", "STATUARIO SLAB", "CALACATTA SLAB", "ONYX SLAB"],
  },
  {
    category: "wall-tiles",
    subcategory: "300x600",
    size: "300x600 MM",
    finish: "Glossy",
    surface: "Glossy",
    pattern: "Decorative",
    collection: "Digital Wall Series",
    names: [
      "VZ-5057 L/HL1/D", "VZ-5059 L/HL1/D", "VZ-5061 L/HL1/D", "VZ-5062 L/HL1/D",
      "VZ-5068 L/HL1/D", "VZ-5116 L/HL1/D", "VZ-5118 L/HL1/D", "VZ-5121 L/HL1/D",
      "VZ-5133 L/HL1/D", "VZ-5141 L/HL1/D", "VZ-5143 L/HL1/D", "VZ-5144 L/HL1/D",
      "VZ-5146 L/HL1/D", "VZ-5147 L/HL1/D", "VZ-5148 L/HL1/D", "VZ-5149 L/HL1/D",
    ],
  },
  {
    category: "wall-tiles",
    subcategory: "300x600",
    size: "300x600 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Decorative",
    collection: "Digital Wall Series",
    names: [
      "VZ-3001 L/HL1/D", "VZ-3003 L/HL1/D", "VZ-3008 L/HL1/D", "VZ-3009 L/HL1/D",
      "VZ-3010 L/HL1/D", "VZ-3011 L/HL1/D", "VZ-3015 L/HL1/D", "VZ-3016 L/HL1/D",
      "VZ-3017 L/HL1/D", "VZ-3020 L/HL1/D", "VZ-3026 L/HL1/D",
    ],
  },
  {
    category: "wall-tiles",
    subcategory: "300x450",
    size: "300x450 MM",
    finish: "Glossy",
    surface: "Glossy",
    pattern: "Decorative",
    collection: "Wall Elevation Series",
    names: ["VZ-2045 GLOSSY A", "VZ-2046 GLOSSY B", "VZ-2047 GLOSSY C", "VZ-2048 GLOSSY D"],
  },
  {
    category: "wooden-strip",
    subcategory: "200x1200",
    size: "200x1200 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Wood",
    collection: "Wooden Strip Series",
    names: [
      "APRICOT BROWN", "APRICOT GREY", "APRICOT GRIS", "CASTELO BEIGE", "CASTELO BROWN",
      "CASTELO SLATE", "ITALY BROWN", "ITALY MIELE", "ITALY NATURAL", "MOUNTAIN BROWN",
      "MOUNTAIN GRIS", "MOUNTAIN HONEY", "PEAR BROWN", "PEAR CAFE", "PEAR MIELE",
    ],
  },
  {
    category: "wooden-strip",
    subcategory: "200x900",
    size: "200x900 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Wood",
    collection: "Wooden Strip Series",
    names: ["OAK NATURAL", "WALNUT BROWN", "TEAK CLASSIC", "CHERRY WOOD"],
  },
  {
    category: "parking-tiles",
    subcategory: "400x400",
    size: "400x400 MM",
    finish: "Matt",
    surface: "Rustic",
    pattern: "Anti-Skid",
    collection: "Parking Series",
    image:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1200&auto=format&fit=crop",
    names: ["PARK GREY", "PARK RED", "PARK YELLOW", "PARK WHITE"],
  },
  {
    category: "parking-tiles",
    subcategory: "300x300",
    size: "300x300 MM",
    finish: "Matt",
    surface: "Rustic",
    pattern: "Anti-Skid",
    collection: "Parking Series",
    image:
      "https://images.unsplash.com/photo-1589939705383-27eb7913a237?q=80&w=1200&auto=format&fit=crop",
    names: ["PARK 300 GREY", "PARK 300 RED"],
  },
  {
    category: "parking-tiles",
    subcategory: "500x500",
    size: "500x500 MM",
    finish: "Matt",
    surface: "Rustic",
    pattern: "Anti-Skid",
    collection: "Parking Series",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82?w=1200&auto=format&fit=crop",
    names: ["PARK 500 GREY", "PARK 500 YELLOW"],
  },
  {
    category: "parking-tiles",
    subcategory: "600x600",
    size: "600x600 MM",
    finish: "Matt",
    surface: "Rustic",
    pattern: "Anti-Skid",
    collection: "Parking Series",
    image:
      "https://images.unsplash.com/photo-1580674285054-bed31dc84503?q=80&w=1200&auto=format&fit=crop",
    names: ["PARK 600 GREY", "PARK 600 RED"],
  },
  {
    category: "elevation-tiles",
    subcategory: "300x600",
    size: "300x600 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Elevation",
    collection: "Elevation Series",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    names: ["EL-501 ELEVATION", "EL-502 ELEVATION", "EL-503 ELEVATION", "EL-504 ELEVATION"],
  },
  {
    category: "elevation-tiles",
    subcategory: "300x450",
    size: "300x450 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Elevation",
    collection: "Elevation Series",
    image:
      "https://images.unsplash.com/photo-1513581166391-887a44cb4a7?w=1200&auto=format&fit=crop",
    names: ["EL-401 FACADE", "EL-402 FACADE", "EL-403 FACADE"],
  },
  {
    category: "elevation-tiles",
    subcategory: "600x1200",
    size: "600x1200 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Elevation",
    collection: "Elevation Series",
    image:
      "https://images.unsplash.com/photo-1600585152915-d0bec72a490e?q=80&w=1200&auto=format&fit=crop",
    names: ["EL-601 LARGE FACADE", "EL-602 LARGE FACADE"],
  },
  {
    category: "elevation-natural-stones",
    subcategory: "natural-stone",
    size: "300x600 MM",
    finish: "Natural",
    surface: "Natural",
    pattern: "Stone",
    collection: "Natural Stone Elevation",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1200&auto=format&fit=crop",
    names: ["SANDSTONE BEIGE", "GRANITE GREY", "SLATE DARK", "TRAVERTINE CREAM"],
  },
  {
    category: "gvt-pgvt",
    subcategory: "1200x1200",
    size: "1200x1200 MM",
    finish: "Matt",
    surface: "Matt",
    pattern: "Concrete",
    collection: "Slab Tiles",
    names: [
      "ARENA GREY", "ARENA GRIS", "CEMENTO BIANCO", "CONCRETA GRAFITO", "CONCRETA WHITE",
      "HELEN LIGHT GREY", "MARB501 DARK", "PANAMA GREY", "SEFORA WHITE",
    ],
  },
];

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function imageUrl(slug, variant = "full") {
  const suffix = variant === "thumb" ? "_thumb" : variant === "medium" ? "_medium" : "";
  return `${BASE_IMG}/${slug}${suffix}.jpg`;
}

function buildPacking(size) {
  const d = PACKING_DEFAULTS[size] || PACKING_DEFAULTS["600x600 MM"];
  return [{ size, ...d }];
}

function buildProduct(group, name, override = {}, index = 0) {
  const slug = slugify(name);
  const size = override.size || group.size;
  const finish = override.finish || group.finish;
  const packing = buildPacking(size);

  const description = `${name} — premium ${group.collection} tile from VK Tiles & Granites in ${size} with ${finish.toLowerCase()} finish. Engineered for durability, low water absorption and elegant interiors.`;

  const hasLiveImage = Boolean(override.image?.includes("valenzaceramic.com/uploads/admin"));
  const fallbackImage = group.image;
  const img = hasLiveImage ? override.image : fallbackImage || imageUrl(slug);
  const useFallback = !hasLiveImage && Boolean(fallbackImage);
  const images = hasLiveImage
    ? [override.image, ...(override.images || [])].filter(Boolean)
    : useFallback
      ? [img]
      : [img, imageUrl(slug, "medium"), imageUrl(slug, "thumb")].filter(Boolean);

  return {
    slug,
    name,
    brand: "VK Tiles & Granites",
    category: group.category,
    subcategory: group.subcategory,
    collection: group.collection,
    collectionSlug: slugify(group.collection),
    description,
    size,
    sizes: [size],
    finish,
    finishes: [finish],
    surface: group.surface,
    pattern: group.pattern,
    thickness: packing[0].thickness,
    thicknesses: [packing[0].thickness],
    packing,
    features: FEATURES,
    applications: APPLICATIONS[group.category] || ["Interior", "Exterior"],
    image: img,
    images,
    imageThumb: hasLiveImage ? override.image : useFallback ? img : imageUrl(slug, "thumb"),
    imageMedium: hasLiveImage ? override.image : useFallback ? img : imageUrl(slug, "medium"),
    availability: "In Stock",
    featured: hasLiveImage && index < 2,
    sourceUrl: override.sourceUrl || `https://www.valenzaceramic.com/product_category/gvtpgvt.html`,
    downloads: {
      catalog: "local",
      specification: "local",
    },
    seo: {
      title: `${name} | ${size} ${finish} | VK Tiles`,
      description: `Buy ${name} ${size} ${finish} tile from VK Tiles & Granites. ${packing[0].tilesPerBox} tiles/box, ${packing[0].coverage} coverage.`,
      keywords: [name, size, finish, group.collection, "VK Tiles", "GVT", "PGVT", "tiles"],
    },
  };
}

function buildCategories(products) {
  const map = new Map();

  for (const p of products) {
    const key = `${p.category}::${p.subcategory}`;
    if (!map.has(key)) {
      map.set(key, {
        slug: p.subcategory,
        name: p.collection,
        category: p.category,
        subcategory: p.subcategory,
        parent: p.category,
        blurb: `VK ${p.collection} — ${p.size}`,
        image: p.image,
        count: 0,
      });
    }
    map.get(key).count++;
  }

  return Array.from(map.values());
}

export function generateCatalog(liveOverrides) {
  const overrideMap = new Map();
  if (liveOverrides?.length) {
    for (const o of liveOverrides) {
      overrideMap.set(slugify(o.name), o);
    }
  }

  const products = [];
  const seen = new Set();

  for (const group of SEED_GROUPS) {
    group.names.forEach((name, index) => {
      const slug = slugify(name);
      if (seen.has(slug)) return;
      seen.add(slug);
      const override = overrideMap.get(slug) || {};
      products.push(buildProduct(group, name, override, index));
    });
  }

  if (liveOverrides?.length) {
    for (const o of liveOverrides) {
      const slug = slugify(o.name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const group = SEED_GROUPS.find((g) => g.category === o.category) || SEED_GROUPS[0];
      products.push(buildProduct({ ...group, ...o }, o.name, o));
    }
  }

  const categories = buildCategories(products);

  return {
    scrapedAt: new Date().toISOString(),
    count: products.length,
    brand: "VK Tiles & Granites",
    categories,
    products,
    errors: [],
  };
}
