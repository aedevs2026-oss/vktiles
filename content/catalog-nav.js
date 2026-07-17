/** Valenza product navigation hierarchy for mega menu & filters */
export const productNav = [
  {
    slug: "wall-tiles",
    name: "Wall Tiles",
    icon: "wall",
    description: "Digital wall tiles for kitchens, bathrooms & interiors",
    image: "https://www.valenzaceramic.com/uploads/category/wall-tiles.jpg",
    children: [
      { slug: "300x450", name: "300×450", href: "/products?category=wall-tiles&subcategory=300x450" },
      { slug: "300x600", name: "300×600", href: "/products?category=wall-tiles&subcategory=300x600" },
      { slug: "600x1200", name: "600×1200", href: "/products?category=wall-tiles&subcategory=600x1200" },
    ],
  },
  {
    slug: "floor-tiles",
    name: "Floor Tiles",
    icon: "floor",
    description: "Premium vitrified floor tiles",
    children: [
      {
        slug: "gvt-pgvt",
        name: "GVT / PGVT",
        icon: "gvt",
        description: "Glazed & polished vitrified tiles",
        children: [
          { slug: "600x600", name: "600×600", href: "/products?category=gvt-pgvt&subcategory=600x600" },
          { slug: "600x1200", name: "600×1200", href: "/products?category=gvt-pgvt&subcategory=600x1200" },
          { slug: "800x1600", name: "800×1600", href: "/products?category=gvt-pgvt&subcategory=800x1600" },
          { slug: "1200x1800", name: "1200×1800", href: "/products?category=gvt-pgvt&subcategory=1200x1800" },
        ],
      },
    ],
  },
  {
    slug: "parking-tiles",
    name: "Parking Tiles",
    icon: "parking",
    description: "Heavy-duty outdoor parking solutions",
    children: [
      { slug: "300x300", name: "300×300", href: "/products?category=parking-tiles&subcategory=300x300" },
      { slug: "400x400", name: "400×400", href: "/products?category=parking-tiles&subcategory=400x400" },
      { slug: "500x500", name: "500×500", href: "/products?category=parking-tiles&subcategory=500x500" },
      { slug: "600x600", name: "600×600", href: "/products?category=parking-tiles&subcategory=600x600" },
    ],
  },
  {
    slug: "wooden-strip",
    name: "Wooden Strip",
    icon: "wood",
    description: "Wood-look porcelain strips",
    children: [
      { slug: "200x900", name: "200×900", href: "/products?category=wooden-strip&subcategory=200x900" },
      { slug: "200x1200", name: "200×1200", href: "/products?category=wooden-strip&subcategory=200x1200" },
    ],
  },
  {
    slug: "elevation-tiles",
    name: "Elevation Tiles",
    icon: "elevation",
    description: "Exterior elevation & facade tiles",
    children: [
      { slug: "300x450", name: "300×450", href: "/products?category=elevation-tiles&subcategory=300x450" },
      { slug: "300x600", name: "300×600", href: "/products?category=elevation-tiles&subcategory=300x600" },
      { slug: "600x1200", name: "600×1200", href: "/products?category=elevation-tiles&subcategory=600x1200" },
    ],
  },
  {
    slug: "elevation-natural-stones",
    name: "Elevation Natural Stones",
    icon: "stone",
    description: "Natural stone elevation finishes",
    href: "/products?category=elevation-natural-stones",
  },
];

export const categoryIcons = {
  wall: "M4 5h16v14H4V5zm2 2v10h12V7H6z",
  floor: "M3 21h18v-2H3v2zm2-4h14l-2-14H7L5 17z",
  gvt: "M12 2L2 7v10l10 5 10-5V7L12 2z",
  parking: "M5 11h14v2H5v-2zm2-6h10l2 4H5l2-4z",
  wood: "M4 20h16M6 16l2-8 2 8 2-6 2 6 2-4 2 4",
  elevation: "M12 3l9 5v8l-9 5-9-5V8l9-5z",
  stone: "M12 2l8 4v6c0 4-8 10-8 10S4 16 4 12V6l8-4z",
};
