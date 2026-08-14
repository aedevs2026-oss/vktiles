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

      <section className="section-padding bg-background" aria-label="Brand details">
        <Container>
          <div className="mb-10 text-center">
            <p className="text-sky text-[10px] font-bold uppercase tracking-[0.22em] mb-3">Brand Details</p>
            <h2 className="font-display text-2xl md:text-3xl text-dark mb-4">
              Premium manufacturer story behind every collection
            </h2>
          </div>

          <div className="grid gap-6 md:gap-8">
            {brands.map((brand) => (
              <article
                key={brand.slug}
                className="grid gap-6 rounded-3xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5 md:grid-cols-[180px_1fr] md:p-7"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-sky-soft/30">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-contain p-5"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="font-display text-2xl text-navy mb-2">{brand.name}</h3>
                  <p className="text-sky text-sm font-medium mb-3">{brand.tagline}</p>
                  <p className="text-gray leading-relaxed mb-4">{brand.description}</p>

                  <ul className="flex flex-wrap gap-2">
                    {brand.highlights.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-sky-soft/60 px-3 py-1.5 text-xs font-medium text-navy"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-white" aria-label="Brand assurance">
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
