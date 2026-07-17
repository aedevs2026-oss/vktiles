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
  gallery,
  testimonials,
  faqs,
  cta,
  contact,
} from "@/content/data";
import { getFeaturedProducts } from "@/lib/products";
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
import ProductCard from "@/components/cards/ProductCard";
import BrandCard from "@/components/cards/BrandCard";
import ServiceCard from "@/components/cards/ServiceCard";
import ProjectCard from "@/components/cards/ProjectCard";
import GalleryCard from "@/components/cards/GalleryCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import FAQAccordion from "@/components/ui/FAQAccordion";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(8);

  return (
    <>
      <Hero slides={heroSlides} />

      <StatsSection stats={statistics} />

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
              subtitle="Wall, floor, parking, wooden strip, elevation, and natural stone — select a line to browse sizes and designs."
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
              {HOME_PRODUCT_CATEGORIES.map((category) => (
                <CategoryCard key={category.slug} category={category} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/products">Browse Full Catalogue</Button>
            </div>
          </Container>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding brand-mesh" aria-label="Featured products">
          <Container>
            <SectionTitle
              eyebrow="Featured"
              title="Premium Product Selection"
              subtitle="Handpicked designs from our showroom — enquire for pricing and delivery."
            />
            <Carousel
              id="featured"
              slidesPerView={1.15}
              spaceBetween={20}
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              navigation
              pagination
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/products">Browse Full Catalogue</Button>
            </div>
          </Container>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-padding bg-white" aria-label="Partner brands">
          <Container>
            <SectionTitle
              eyebrow="Trusted Partners"
              title="Top International Brands"
              subtitle="Authorised dealer for India's leading tile and stone manufacturers."
            />
            <Carousel
              id="brands"
              slidesPerView={2}
              spaceBetween={16}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 6 },
              }}
              navigation={false}
              pagination
            >
              {brands.map((brand) => (
                <BrandCard key={brand.slug} brand={brand} />
              ))}
            </Carousel>
            <div className="text-center mt-12">
              <Button href="/brands" variant="outline">
                All Brands
              </Button>
            </div>
          </Container>
        </section>
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
              subtitle="Real installations showcasing the beauty of premium tiles, granite and marble."
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
              subtitle="Trusted by homeowners, contractors and designers across Tamil Nadu."
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
      </Reveal>

      <CTA data={cta} />
      <ContactPreview data={contact} />
    </>
  );
}
