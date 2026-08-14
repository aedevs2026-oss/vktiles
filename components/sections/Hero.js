"use client";

import AppImage from "@/components/ui/AppImage";
import { motion, AnimatePresence } from "framer-motion";
import { useId, useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y, Navigation } from "swiper/modules";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

const heroNavBtn =
  "w-11 h-11 rounded-full border border-white/25 bg-navy/45 backdrop-blur-md flex items-center justify-center text-white hover:bg-sky hover:border-sky transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-navy";

function HeroVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster || ""}
      className="absolute inset-0 h-full w-full object-cover object-center bg-navy"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export default function Hero({ slides = [], data, compact = false }) {
  const items = slides.length ? slides : data ? [{ ...data, id: "hero-1" }] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const heroId = useId().replace(/:/g, "");
  const prevClass = `hero-${heroId}-prev`;
  const nextClass = `hero-${heroId}-next`;

  if (!items.length) return null;

  const slide = items[activeIndex] || items[0];
  const content = {
    eyebrow: slide?.eyebrow || data?.eyebrow,
    title: slide?.title || data?.title,
    subtitle: slide?.subtitle || data?.subtitle,
    ctaPrimary: slide?.ctaPrimary || data?.ctaPrimary,
    ctaSecondary: slide?.ctaSecondary || data?.ctaSecondary,
  };
  const hasContent = Boolean(
    content.eyebrow || content.title || content.subtitle || content.ctaPrimary || content.ctaSecondary
  );

  const heightClass = compact
    ? hasContent
      ? "min-h-[min(72vh,640px)] md:min-h-[min(68vh,560px)]"
      : "min-h-[min(72vh,640px)]"
    : hasContent
      ? "min-h-[min(88vh,820px)] sm:min-h-[min(82vh,760px)] md:min-h-[min(75vh,700px)] lg:h-screen lg:min-h-0"
      : "h-[72vh] min-h-[300px] sm:h-[70vh] md:h-[42vw] lg:h-screen";

  const showHeroArrows = false;
  const hasMultiple = items.length > 1;

  const contentAnimKey =
    slide?.title || slide?.eyebrow || slide?.subtitle ? slide.id || activeIndex : "hero-overlay";

  return (
    <section
      className={`relative ${heightClass} overflow-hidden bg-navy isolate`}
      aria-label="Hero banner"
      data-gsap-skip
    >
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, A11y, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          loop={hasMultiple}
          autoplay={
            hasMultiple
              ? { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          navigation={
            showHeroArrows
              ? { prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }
              : false
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="hero-bg-swiper h-full w-full"
          aria-hidden={hasContent ? true : undefined}
        >
          {items.map((item, i) => (
            <SwiperSlide key={item.id || i}>
              <div className="relative h-full w-full">
                {item.video ? (
                  <HeroVideo src={item.video} poster={item.poster || item.image} />
                ) : item.image ? (
                  <AppImage
                    src={item.image}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover object-center hero-ken-burns"
                    sizes="100vw"
                  />
                ) : null}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className={`absolute inset-0 z-[1] pointer-events-none ${
          hasContent
            ? compact
              ? "bg-gradient-to-r from-navy/82 via-navy/55 to-navy/25 hero-overlay"
              : "bg-gradient-to-r from-navy/92 via-navy/70 to-navy/35 md:to-navy/20"
            : "bg-gradient-to-b from-black/20 via-transparent to-black/25"
        }`}
      />

      {showHeroArrows && (
        <>
          <button
            type="button"
            className={`${prevClass} absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 ${heroNavBtn}`}
            aria-label="Previous slide"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`${nextClass} absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 ${heroNavBtn}`}
            aria-label="Next slide"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {hasContent && (
        <Container className="relative z-20 py-10 pb-12 sm:py-14 md:py-20">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={contentAnimKey}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {content.eyebrow && (
                  <p className="text-sky-bright text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.25em] mb-3 sm:mb-4">
                    {content.eyebrow}
                  </p>
                )}
                {content.title && (
                  <h1 className="font-display text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-6xl text-white text-balance mb-4 sm:mb-5">
                    {content.title}
                  </h1>
                )}
                {content.subtitle && (
                  <p className="text-white/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mb-6 sm:mb-8">
                    {content.subtitle}
                  </p>
                )}
                {(content.ctaPrimary || content.ctaSecondary) && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {content.ctaPrimary && (
                      <Button href={content.ctaPrimary.href} size="lg" className="w-full sm:w-auto justify-center">
                        {content.ctaPrimary.label}
                      </Button>
                    )}
                    {content.ctaSecondary && (
                      <Button
                        href={content.ctaSecondary.href}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto justify-center !border-white/35 !text-white hover:!bg-white/10"
                        external={content.ctaSecondary.href?.startsWith("http")}
                      >
                        {content.ctaSecondary.label}
                      </Button>
                    )}
                  </div>
                )}
                <div className="brand-line mt-6 sm:mt-8 !bg-gradient-to-r from-sky to-sky-bright" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      )}

      {hasMultiple && !compact && !hasContent && (
        <div
          className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none"
          aria-hidden="true"
        >
          {items.map((item, i) => (
            <span
              key={item.id || i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIndex ? "w-8 bg-sky-bright" : "w-2 bg-white/35"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
