import Link from "next/link";
import { HOME_PRODUCT_CATEGORIES } from "@/content/product-categories";
import {
  heroSlides,
  statistics,
  about,
  whyChooseUs,
  brands,
  services,
  projects,
  faqs,
  cta,
  contact,
  pageSeo,
} from "@/content/data";
import { getGallery, getTestimonials } from "@/lib/site-content";
import { getFeaturedProducts, getBestSellers, getNewArrivals, getProducts } from "@/lib/products";
import { generatePageMetadata } from "@/lib/seo";
import Hero from "@/components/sections/Hero";
import StatsSection from "@/components/sections/StatsSection";
import AboutPreview from "@/components/sections/AboutPreview";
import WhyChooseSection from "@/components/sections/WhyChooseSection";
import ContactPreview from "@/components/sections/ContactPreview";
import SectionTitle from "@/components/sections/SectionTitle";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Carousel from "@/components/ui/Carousel";
import Reveal, { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import CategoryCard from "@/components/cards/CategoryCard";
import ProductShowcaseSection from "@/components/sections/ProductShowcaseSection";
import PartnersStrip from "@/components/sections/PartnersStrip";
import ServiceCard from "@/components/cards/ServiceCard";
import ProjectCard from "@/components/cards/ProjectCard";
import GalleryCard from "@/components/cards/GalleryCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import FAQAccordion from "@/components/ui/FAQAccordion";
import ServiceAreaSection from "@/components/seo/ServiceAreaSection";

export const metadata = generatePageMetadata(pageSeo.home);

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(10);
  const bestSellers = getBestSellers(10);
  const newArrivals = getNewArrivals(10);
  const gallery = getGallery();
  const testimonials = getTestimonials();

  const productCounts = {};
  for (const p of getProducts()) {
    productCounts[p.category] = (productCounts[p.category] || 0) + 1;
  }
  const homeCategories = HOME_PRODUCT_CATEGORIES.map((category) => ({
    ...category,
    count: productCounts[category.dataCategory] || 0,
  }));

  return (
    <>
      <Hero slides={heroSlides} />

      <StatsSection stats={statistics} />

      {newArrivals.length > 0 && (
        <Reveal delay={0.04}>
          <ProductShowcaseSection
            id="new-arrivals"
            title="New Arrivals"
            subtitle="Freshly added tile styles, finishes and collection updates for modern spaces and new projects."
            products={newArrivals}
            badge="new"
            badgeLabel="New Arrival"
            variant="muted"
            viewAllHref="/products"
            viewAllLabel="View latest picks"
            autoplayDelay={4600}
          />
        </Reveal>
      )}

      <Reveal>
        <ProductShowcaseSection
          id="featured-products"
          title="Featured Products"
          subtitle="Handpicked wholesale GVT, wall, elevation and wooden strip tiles — best rates for Dharmapuri, Salem and Tamil Nadu projects."
          products={featuredProducts}
          badge="featured"
          badgeLabel="Featured"
          variant="mesh"
          viewAllHref="/products"
          viewAllLabel="All featured"
          autoplayDelay={4500}
        />
      </Reveal>

      <Reveal delay={0.08}>
        <ProductShowcaseSection
          id="best-sellers"
          title="Best Sellers & Popular Picks"
          subtitle="Top-requested wholesale tile collections — most popular picks for builders and homeowners in Dharmapuri, Salem, Kadathur and Bommidi."
          products={bestSellers}
          badge="bestseller"
          badgeLabel="Best Seller"
          variant="muted"
          viewAllHref="/products"
          viewAllLabel="Shop popular"
          autoplayDelay={4800}
        />
      </Reveal>

      <Reveal>
        <AboutPreview data={about} />
      </Reveal>

      <Reveal delay={0.05}>
        <WhyChooseSection items={whyChooseUs} />
      </Reveal>

      <Reveal>
        <section
          id="product-categories"
          className="section-padding bg-white scroll-mt-28"
          aria-label="Product categories"
        >
          <Container>
            <SectionTitle
              eyebrow="VK Tiles"
              title="Product Categories"
              subtitle="Wholesale floor tile and wooden strip collections — all sizes and designs with delivery across Dharmapuri, Salem and Tamil Nadu."
            />
            <Carousel
              id="categories"
              slidesPerView={1.15}
              spaceBetween={16}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              navigation
              pagination
            >
              {homeCategories.map((category) => (
                <CategoryCard key={category.slug} category={category} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/products">Browse Full Catalogue</Button>
            </div>
          </Container>
        </section>
      </Reveal>

      <PartnersStrip brands={brands} />

      <Reveal>
        <ServiceAreaSection />
      </Reveal>

      <Reveal>
        <section className="section-padding bg-background" aria-label="Our services">
          <RevealStagger stagger={0.1}>
            <Container>
              <RevealItem>
                <SectionTitle
                  eyebrow="What We Offer"
                  title="End-to-End Surface Solutions"
                  subtitle="From selection to delivery — we support homeowners, builders, architects and dealers."
                />
              </RevealItem>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {services.map((service) => (
                  <RevealItem key={service.slug}>
                    <ServiceCard service={service} />
                  </RevealItem>
                ))}
              </div>
            </Container>
          </RevealStagger>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding bg-white" aria-label="Completed projects">
          <Container>
            <SectionTitle
              eyebrow="Our Work"
              title="Projects We've Delivered"
              subtitle="Residential villas, apartment complexes, hotels and commercial spaces across Tamil Nadu."
            />
            <Carousel
              id="projects"
              slidesPerView={1.1}
              spaceBetween={20}
              autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              navigation
              pagination
            >
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/projects" variant="outline">
                View All Projects
              </Button>
            </div>
          </Container>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding bg-background" aria-label="Gallery">
          <Container>
            <SectionTitle
              eyebrow="Visual Showcase"
              title="Gallery"
              subtitle="Real tile and granite installations across Dharmapuri, Salem, Bommidi and Tamil Nadu."
            />
            <Carousel
              id="gallery"
              slidesPerView={1.1}
              spaceBetween={16}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              navigation
              pagination
            >
              {gallery.map((item) => (
                <GalleryCard key={item.slug} item={item} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/gallery" variant="outline">
                Full Gallery
              </Button>
            </div>
          </Container>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding bg-white" aria-label="Customer testimonials">
          <Container>
            <SectionTitle
              eyebrow="Testimonials"
              title="What Our Customers Say"
              subtitle="Trusted by homeowners, builders and contractors in Dharmapuri, Salem, Kadathur and across Tamil Nadu."
            />
            <Carousel
              id="testimonials"
              slidesPerView={1}
              spaceBetween={24}
              autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation
              pagination
            >
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Link href="/testimonials" className="text-gold text-sm font-medium hover:underline">
                Read more testimonials →
              </Link>
            </div>
          </Container>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding bg-background" aria-label="Frequently asked questions">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <SectionTitle
                eyebrow="FAQ"
                title="Common Questions"
                subtitle="Everything you need to know about wholesale tiles and granites in Dharmapuri, Salem, Kadathur, Bommidi and Tamil Nadu."
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
      </Reveal>

      <CTA data={cta} />
      <ContactPreview data={contact} />
    </>
  );
}