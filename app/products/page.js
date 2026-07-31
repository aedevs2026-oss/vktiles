import { getProducts } from "@/lib/products";
import { productHeroSlides, cta } from "@/content/data";
import { generatePageMetadata } from "@/lib/seo";
import Hero from "@/components/sections/Hero";
import CTA from "@/components/sections/CTA";
import SectionTitle from "@/components/sections/SectionTitle";
import ProductCatalog from "@/components/products/ProductCatalog";

export const revalidate = 3600;

export const metadata = generatePageMetadata({
  title: "Products",
  description:
    "Browse VK Tiles & Granites — GVT/PGVT floor tiles and wooden strip collections with full specifications and packing details.",
  path: "/products",
  keywords: ["VK Tiles", "GVT tiles", "PGVT", "wall tiles", "parking tiles", "Bommidi"],
});

export default async function ProductsPage({ searchParams }) {
  const products = getProducts();

  const params = await searchParams;
  const initialFilters = {
    category: params?.category || "",
    subcategory: params?.subcategory || "",
    size: params?.size || "",
  };

  return (
    <>
      <Hero slides={productHeroSlides} compact />

      <section id="catalogue" className="section-padding brand-mesh scroll-mt-24" aria-label="Product catalogue">
        <div className="mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="VK Tiles Catalogue"
            title="Find Your Tile"
            subtitle="Choose a category, then a size, to explore matching designs."
          />
        </div>
        <ProductCatalog products={products} initialFilters={initialFilters} />
      </section>

      <CTA data={cta} />
    </>
  );
}
