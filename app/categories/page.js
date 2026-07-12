import { categories, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import CategoryCard from "@/components/cards/CategoryCard";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Categories",
  description:
    "Explore tile and stone categories — floor tiles, wall tiles, vitrified, granite, marble, kitchen, bathroom and more.",
};

export default function CategoriesPage() {
  const header = pageHeaders.categories;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Product categories">
        <Container>
          <SectionTitle
            eyebrow="Our Collection"
            title="Browse by Category"
            subtitle="From everyday floor tiles to imported marble — find the perfect surface for every space."
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
