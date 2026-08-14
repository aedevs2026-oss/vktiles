"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import Container from "@/components/layout/Container";
import { bannerCarouselImages } from "@/content/data";
import { gsap, registerGsapPlugins } from "@/lib/gsap-client";
import "swiper/css";
import "swiper/css/effect-fade";

export default function PageBanner({ title, subtitle, image, images }) {
  const bannerRef = useRef(null);
  const slides =
    images?.length > 0
      ? images
      : image
        ? [image, ...bannerCarouselImages.filter((i) => i !== image)].slice(0, 4)
        : bannerCarouselImages;

  useEffect(() => {
    registerGsapPlugins();
    const banner = bannerRef.current;
    if (!banner) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-banner-title]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from("[data-banner-subtitle]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.35,
      });

      gsap.from("[data-banner-line]", {
        scaleX: 0,
        duration: 0.6,
        ease: "power2.inOut",
        delay: 0.55,
      });
    }, banner);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <section
      ref={bannerRef}
      className="relative py-20 md:py-28 overflow-hidden bg-navy min-h-[280px]"
      aria-label="Page header"
      data-gsap-skip
    >
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.length === 1 ? (
            <>
              <div className="absolute inset-0 opacity-30">
                <AppImage
                  src={slides[0]}
                  alt=""
                  fill
                  priority
                  className="object-cover scale-105"
                  sizes="100vw"
                />
              </div>
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
                  <div className="relative h-full min-h-[280px] opacity-30">
                    <AppImage src={src} alt="" fill className="object-cover scale-105" sizes="100vw" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="absolute inset-0 hero-overlay opacity-90" aria-hidden="true" />
        </div>
      )}

      <Container className="relative z-10 text-center">
        <h1
          data-banner-title
          className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 text-balance"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            data-banner-subtitle
            className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </p>
        )}
        <div data-banner-line className="brand-line mx-auto mt-8 origin-left" aria-hidden="true" />
      </Container>
    </section>
  );
}
