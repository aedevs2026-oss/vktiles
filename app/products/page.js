import { products, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import ProductCard from "@/components/cards/ProductCard";

export const metadata = {
  title: "Products",
  description:
    "Browse VK Tiles & Granites' premium catalogue — vitrified tiles, granite, marble, bathroom sets and elevation panels.",
};

export default function ProductsPage() {
  const header = pageHeaders.products;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Product catalogue">
        <Container>
          <SectionTitle
            eyebrow="Full Catalogue"
            title="Premium Product Selection"
            subtitle="Handpicked designs from our showroom — enquire for pricing, availability and delivery."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
