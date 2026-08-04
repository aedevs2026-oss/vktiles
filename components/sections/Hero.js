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
  const heightClass = compact
    ? "min-h-[72vh]"
    : "h-[56vw] md:h-[40vw] lg:h-screen";

  return (
    <section
      className={`relative ${heightClass} flex items-center overflow-hidden bg-navy`}
      aria-label="Hero banner"
    >
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
            <div className="relative h-full">
              {item.video ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center"
                  poster={item.poster || ""}
                >
                  <source src={item.video} type="video/mp4" />
                </video>
              ) : (
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
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />

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