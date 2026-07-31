import { pageHeaders, cta } from "@/content/data";
import { getTestimonials } from "@/lib/site-content";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

export const metadata = {
  title: "Testimonials",
  description:
    "Read what homeowners, contractors and designers say about VK Tiles & Granites — premium quality and trusted service.",
};

export default function TestimonialsPage() {
  const header = pageHeaders.testimonials;
  const testimonials = getTestimonials();

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Customer testimonials">
        <Container>
          <SectionTitle
            eyebrow="Reviews"
            title="What Our Customers Say"
            subtitle="5000+ happy homes, hotels and commercial projects delivered across Tamil Nadu."
          />
          <TestimonialsCarousel items={testimonials} />
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
