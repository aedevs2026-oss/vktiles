"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import "swiper/css";
import "swiper/css/effect-fade";

import { BLUR_DATA_URL } from "@/lib/images";

export default function Hero({ slides = [], data, compact = false }) {
  const items = slides.length ? slides : data ? [{ ...data, id: "hero-1" }] : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) return null;

  const slide = items[activeIndex] || items[0];
  const hasMultiple = items.length > 1;
  const minHeight = compact ? "min-h-[72vh]" : "min-h-[88vh]";

  return (
    <section
      className={`relative ${minHeight} flex items-center overflow-hidden bg-navy`}
      aria-label="Hero banner"
    >
      {/* Auto-sliding background */}
      <Swiper
        modules={[Autoplay, EffectFade, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        loop={hasMultiple}
        autoplay={
          hasMultiple
            ? { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="absolute inset-0 !h-full !w-full hero-bg-swiper"
        aria-hidden="true"
      >
        {items.map((item, i) => (
          <SwiperSlide key={item.id || i} className="!h-full">
            <div className={`relative h-full ${minHeight}`}>
              <Image
                src={item.image}
                alt=""
                fill
                priority={i === 0}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover object-center hero-ken-burns"
                sizes="100vw"
              />
              <div className="absolute inset-0 hero-overlay" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content panel — spans full width so its own dedicated background image is visible; text stays pinned left */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id || activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full overflow-hidden"
          >
            {/* Dedicated background image for this panel — slow Ken Burns on each slide change */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.12, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 5.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={slide.contentImage || slide.image}
                alt=""
                fill
                priority={activeIndex === 0}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover object-center hero-ken-burns-slow"
                sizes="100vw"
              />
            </motion.div>
            {/* Gradient so the image reads clearly on the right while text stays legible on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy/88 via-navy/50 to-navy/15" />

            <Container className="relative h-full">
              <div className="flex h-full items-center py-24 md:py-32">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-3xl text-left"
                >
                  {slide.eyebrow && (
                    <p className="text-sky-bright text-xs font-semibold uppercase tracking-[0.28em] mb-5">
                      {slide.eyebrow}
                    </p>
                  )}
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] text-balance mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-xl mb-10">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
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
                        className="!text-white !border-white/50 hover:!bg-white hover:!text-navy"
                      >
                        {slide.ctaSecondary.label}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </Container>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal slide progress — no nav buttons */}
      {hasMultiple && (
        <div
          className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-2 pointer-events-none"
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