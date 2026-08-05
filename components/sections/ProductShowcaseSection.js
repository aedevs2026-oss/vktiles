import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/cards/ProductCard";

const SECTION_ACCENTS = {
  featured: {
    glow: "from-sky/20 via-transparent to-transparent",
  },
  new: {
    glow: "from-emerald-400/15 via-transparent to-transparent",
  },
  bestseller: {
    glow: "from-amber-400/20 via-transparent to-transparent",
  },
};

const PRODUCT_SLIDER_BREAKPOINTS = {
  480: { slidesPerView: 1.4, spaceBetween: 14 },
  640: { slidesPerView: 2.2, spaceBetween: 16 },
  768: { slidesPerView: 3, spaceBetween: 18 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1280: { slidesPerView: 5, spaceBetween: 20 },
};

export default function ProductShowcaseSection({
  id,
  eyebrow,
  title,
  subtitle,
  products = [],
  badge = "featured",
  badgeLabel,
  variant = "mesh",
  viewAllHref = "/products",
  viewAllLabel = "View all products",
  autoplayDelay = 4200,
}) {
  if (!products.length) return null;

  const accent = SECTION_ACCENTS[badge] || SECTION_ACCENTS.featured;
  const bgClass =
    variant === "white"
      ? "bg-white"
      : variant === "muted"
        ? "bg-background"
        : "brand-mesh";

  return (
    <section className={`section-padding ${bgClass} relative overflow-hidden`} aria-label={title}>
      <div
        className={`pointer-events-none absolute -top-24 right-0 w-[min(520px,80vw)] h-[min(520px,80vw)] rounded-full bg-gradient-to-br ${accent.glow} blur-3xl opacity-80`}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mb-10">
          <SectionTitle
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align="left"
            className="mb-0 !gap-3"
          />
          <a
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sky text-sm font-medium mt-5 hover:text-sky-bright transition-colors"
          >
            {viewAllLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <Carousel
          id={id}
          slidesPerView={1.2}
          spaceBetween={14}
          speed={650}
          navigation={false}
          pagination={false}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={PRODUCT_SLIDER_BREAKPOINTS}
        >
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
