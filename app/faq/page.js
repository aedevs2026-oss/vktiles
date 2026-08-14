import { faqs, pageHeaders, cta, business, pageSeo } from "@/content/data";
import { generatePageMetadata } from "@/lib/seo";
import { generateFAQPageJsonLd } from "@/lib/schema";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Button from "@/components/ui/Button";

export const metadata = generatePageMetadata(pageSeo.faq);

export default function FAQPage() {
  const header = pageHeaders.faq;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQPageJsonLd(faqs)) }}
      />
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Frequently asked questions">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionTitle
              eyebrow="Help Centre"
              title="Wholesale Tiles & Granites — Questions Answered"
              subtitle="Direct answers about the best wholesale tile and granite dealer in Dharmapuri, Salem, Kadathur, Bommidi and all over Tamil Nadu."
              className="mb-10"
            />
            <FAQAccordion items={faqs} />
            <div className="mt-10 p-6 bg-background text-center">
              <p className="text-dark font-medium mb-2">Still have questions?</p>
              <p className="text-gray text-sm mb-4">
                Reach us at {business.phone} or send an enquiry online.
              </p>
              <Button href="/contact">Contact Us</Button>
            </div>
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
