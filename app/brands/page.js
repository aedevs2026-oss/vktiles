import { brands, pageHeaders, cta, pageSeo } from "@/content/data";
import { generatePageMetadata } from "@/lib/seo";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import BrandCard from "@/components/cards/BrandCard";

export const metadata = generatePageMetadata(pageSeo.brands);

export default function BrandsPage() {
  const header = pageHeaders.brands;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Partner brands">
        <Container>
          <SectionTitle
            eyebrow="Trusted Partners"
            title="Top Tile & Granite Brands"
            subtitle="Authorised wholesale dealer for Simpolo, Italica and premium manufacturers — genuine products at best rates in Dharmapuri & Salem."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6" data-gsap-stagger>
            {brands.map((brand) => (
              <div key={brand.slug} id={brand.slug}>
                <BrandCard brand={brand} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-background" aria-label="Brand assurance">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl text-dark mb-4">
              100% Genuine, Authorised Products
            </h2>
            <p className="text-gray text-base leading-relaxed">
              Every brand we carry comes directly from authorised distributors. Whether you&apos;re a homeowner
              in Salem, a builder in Dharmapuri or a contractor in Kadathur, you get the same authentic quality
              and competitive wholesale rates with delivery across Tamil Nadu.
            </p>
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
