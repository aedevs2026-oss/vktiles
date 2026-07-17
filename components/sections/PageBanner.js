"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import Container from "@/components/layout/Container";
import { bannerCarouselImages } from "@/content/data";
import "swiper/css";
import "swiper/css/effect-fade";

export default function PageBanner({ title, subtitle, image, images }) {
  const slides =
    images?.length > 0
      ? images
      : image
        ? [image, ...bannerCarouselImages.filter((i) => i !== image)].slice(0, 4)
        : bannerCarouselImages;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-navy min-h-[280px]" aria-label="Page header">
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.length === 1 ? (
            <>
              <Image
                src={slides[0]}
                alt=""
                fill
                className="object-cover opacity-30 scale-105"
                sizes="100vw"
                priority
              />
            </>
          ) : (
            <Swiper
              modules={[Autoplay, EffectFade, A11y]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={1200}
              loop
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="h-full w-full"
            >
              {slides.map((src) => (
                <SwiperSlide key={src}>
                  <div className="relative h-full min-h-[280px]">
                    <Image src={src} alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="absolute inset-0 hero-overlay opacity-90" aria-hidden="true" />
        </div>
      )}

      <Container className="relative z-10 text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 text-balance animate-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up-delay">
            {subtitle}
          </p>
        )}
        <div className="brand-line mx-auto mt-8" aria-hidden="true" />
      </Container>
    </section>
  );
}
