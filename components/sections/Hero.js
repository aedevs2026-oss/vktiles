"use client";

import AppImage from "@/components/ui/AppImage";
import { motion, AnimatePresence } from "framer-motion";
import { useId, useState } from "react";
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

export default function Hero({ slides = [], data, compact = false }) {
  const items = slides.length ? slides : data ? [{ ...data, id: "hero-1" }] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const heroId = useId().replace(/:/g, "");
  const prevClass = `hero-${heroId}-prev`;
  const nextClass = `hero-${heroId}-next`;

  if (!items.length) return null;

  const slide = items[activeIndex] || items[0];
  const hasMultiple = items.length > 1;
  const hasContent = Boolean(slide.title || slide.eyebrow || slide.subtitle);

  const heightClass = compact
    ? hasContent
      ? "min-h-[min(72vh,640px)] md:min-h-[min(68vh,560px)]"
      : "min-h-[min(72vh,640px)]"
    : "h-[56vw] md:h-[40vw] lg:h-screen";

  const showHeroArrows = false;

  return (
    <section
      className={`relative ${heightClass} flex items-center overflow-hidden bg-navy`}
      aria-label="Hero banner"
    >
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
        className="absolute inset-0 !h-full !w-full hero-bg-swiper"
        aria-hidden={hasContent ? true : undefined}
      >
        {items.map((item, i) => (
          <SwiperSlide key={item.id || i} className="!h-full">
            <div className="relative h-full min-h-[280px]">
              {item.video ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center"
                  poster={item.poster || item.image || ""}
                >
                  <source src={item.video} type="video/mp4" />
                </video>
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

      <div
        className={`absolute inset-0 z-10 ${
          hasContent
            ? compact
              ? "bg-gradient-to-r from-navy/82 via-navy/55 to-navy/25 hero-overlay"
              : "bg-gradient-to-r from-navy/92 via-navy/70 to-navy/35 md:to-navy/20"
            : "bg-gradient-to-r from-black/30 via-black/10 to-transparent"
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
        <Container className="relative z-20 py-16 md:py-20">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id || activeIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {slide.eyebrow && (
                  <p className="text-sky-bright text-xs font-semibold uppercase tracking-[0.25em] mb-4">
                    {slide.eyebrow}
                  </p>
                )}
                {slide.title && (
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white text-balance leading-tight mb-5">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-xl mb-8">
                    {slide.subtitle}
                  </p>
                )}
                {(slide.ctaPrimary || slide.ctaSecondary) && (
                  <div className="flex flex-wrap gap-3">
                    {slide.ctaPrimary && (
                      <Button href={slide.ctaPrimary.href} size="lg">
                        {slide.ctaPrimary.label}
                      </Button>
                    )}
                    {slide.ctaSecondary && (
                      <Button
                        href={slide.ctaSecondary.href}
                        variant="outline"
                        size="lg"
                        className="!border-white/35 !text-white hover:!bg-white/10"
                        external={slide.ctaSecondary.href?.startsWith("http")}
                      >
                        {slide.ctaSecondary.label}
                      </Button>
                    )}
                  </div>
                )}
                <div className="brand-line mt-8 !bg-gradient-to-r from-sky to-sky-bright" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      )}

      {hasMultiple && !compact && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none"
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
