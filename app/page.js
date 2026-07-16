import Link from "next/link";
import {
  hero,
  statistics,
  about,
  whyChooseUs,
  categories,
  featuredProducts,
  brands,
  services,
  projects,
  gallery,
  testimonials,
  faqs,
  cta,
  contact,
} from "@/content/data";
import Hero from "@/components/sections/Hero";
import StatsSection from "@/components/sections/StatsSection";
import AboutPreview from "@/components/sections/AboutPreview";
import WhyChooseSection from "@/components/sections/WhyChooseSection";
import ContactPreview from "@/components/sections/ContactPreview";
import SectionTitle from "@/components/sections/SectionTitle";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import CategoryCard from "@/components/cards/CategoryCard";
import ProductCard from "@/components/cards/ProductCard";
import BrandCard from "@/components/cards/BrandCard";
import ServiceCard from "@/components/cards/ServiceCard";
import ProjectCard from "@/components/cards/ProjectCard";
import GalleryCard from "@/components/cards/GalleryCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import FAQAccordion from "@/components/ui/FAQAccordion";

export default function HomePage() {
  const homeCategories = categories.slice(0, 6);

  return (
    <>
      <Hero data={hero} />
      <StatsSection stats={statistics} />
      <AboutPreview data={about} />
      <WhyChooseSection items={whyChooseUs} />

      {/* Collections */}
      <section className="section-padding bg-white" aria-label="Product collections">
        <Container>
          <SectionTitle
            eyebrow="Simpolo Collections"
            title="Explore by Collection"
            subtitle="Browse curated tile collections — wall and floor designs with full packing details."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/categories" variant="outline">
              View All Collections
            </Button>
          </div>
        </Container>
      </section>

      {/* Products */}
      <section className="section-padding brand-mesh" aria-label="Featured products">
        <Container>
          <SectionTitle
            eyebrow="Featured"
            title="Premium Product Selection"
            subtitle="Handpicked Simpolo designs from our showroom — enquire for pricing and delivery."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/products">Browse Full Catalogue</Button>
          </div>
        </Container>
      </section>

      {/* Brands */}
      <section className="section-padding bg-white" aria-label="Partner brands">
        <Container>
          <SectionTitle
            eyebrow="Trusted Partners"
            title="Top International Brands"
            subtitle="Authorised dealer for India's leading tile and stone manufacturers."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {brands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/brands" variant="outline">
              All Brands
            </Button>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="section-padding bg-background" aria-label="Our services">
        <Container>
          <SectionTitle
            eyebrow="What We Offer"
            title="End-to-End Surface Solutions"
            subtitle="From selection to delivery — we support homeowners, builders, architects and dealers."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </section>

      {/* Projects */}
      <section className="section-padding bg-white" aria-label="Completed projects">
        <Container>
          <SectionTitle
            eyebrow="Our Work"
            title="Projects We've Delivered"
            subtitle="Residential villas, apartment complexes, hotels and commercial spaces across Tamil Nadu."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/projects" variant="outline">
              View All Projects
            </Button>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-background" aria-label="Gallery">
        <Container>
          <SectionTitle
            eyebrow="Visual Showcase"
            title="Gallery"
            subtitle="Real installations showcasing the beauty of premium tiles, granite and marble."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gallery.map((item) => (
              <GalleryCard key={item.slug} item={item} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/gallery" variant="outline">
              Full Gallery
            </Button>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white" aria-label="Customer testimonials">
        <Container>
          <SectionTitle
            eyebrow="Testimonials"
            title="What Our Customers Say"
            subtitle="Trusted by homeowners, contractors and designers across Tamil Nadu."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/testimonials" className="text-gold text-sm font-medium hover:underline">
              Read more testimonials →
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background" aria-label="Frequently asked questions">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <SectionTitle
              eyebrow="FAQ"
              title="Common Questions"
              subtitle="Everything you need to know before visiting our showroom or placing an order."
              align="left"
              className="mb-0"
            />
            <FAQAccordion items={faqs} limit={5} />
          </div>
          <div className="text-center mt-10">
            <Button href="/faq" variant="outline" size="sm">
              View All FAQs
            </Button>
          </div>
        </Container>
      </section>

      <CTA data={cta} />
      <ContactPreview data={contact} />
    </>
  );
}
