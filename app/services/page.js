import { services, processSteps, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import ServiceCard from "@/components/cards/ServiceCard";

export const metadata = {
  title: "Services",
  description:
    "VK Tiles & Granites offers wholesale supply, design consultation, site delivery and custom granite & marble cutting.",
};

export default function ServicesPage() {
  const header = pageHeaders.services;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Our services">
        <Container>
          <SectionTitle
            eyebrow="What We Offer"
            title="End-to-End Surface Solutions"
            subtitle="From selection to delivery — we support homeowners, builders, architects and dealers."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.slug} id={service.slug}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-background" aria-label="How we work">
        <Container>
          <SectionTitle
            eyebrow="Our Process"
            title="From Showroom to Site"
            subtitle="A simple, transparent process designed for retail customers and bulk buyers alike."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <article key={step.title} className="bg-white p-6 text-center card-hover">
                <span className="inline-flex w-10 h-10 items-center justify-center bg-gold text-white font-display text-lg mb-4">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg text-dark mb-2">{step.title}</h3>
                <p className="text-gray text-sm leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
