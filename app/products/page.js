import { products, categories, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import SectionTitle from "@/components/sections/SectionTitle";
import ProductCatalog from "@/components/products/ProductCatalog";

export const metadata = {
  title: "Products",
  description:
    "Browse Simpolo tile collections at VK Tiles & Granites — sizes, finishes and packing details.",
};

export default async function ProductsPage({ searchParams }) {
  const header = pageHeaders.products;
  const params = await searchParams;
  const initialCollection = params?.collection || "";

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding brand-mesh" aria-label="Product catalogue">
        <div className="mb-10">
          <SectionTitle
            eyebrow="Full Catalogue"
            title="Simpolo Product Selection"
            subtitle="Filter by collection. Every design includes sizes, finishes and packing details."
          />
        </div>
        <ProductCatalog
          products={products}
          categories={categories}
          initialCollection={initialCollection}
        />
      </section>

      <CTA data={cta} />
    </>
  );
}
