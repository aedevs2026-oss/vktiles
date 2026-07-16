import { categories, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import CategoryCard from "@/components/cards/CategoryCard";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Collections",
  description:
    "Browse Simpolo tile collections at VK Tiles & Granites — curated designs with packing details.",
};

export default function CategoriesPage() {
  const header = pageHeaders.categories;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding brand-mesh" aria-label="Product collections">
        <Container>
          <SectionTitle
            eyebrow="Simpolo Collections"
            title="Browse by Collection"
            subtitle="Categories are based on product collections — not room labels. Explore every design with sizes and packing details."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.slug} id={category.slug}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/products">View All Products</Button>
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
