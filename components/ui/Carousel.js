"use client";

import { useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  EffectFade,
  EffectCreative,
} from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-creative";

export default function Carousel({
  id,
  children,
  effect = "slide",
  autoplay = { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
  loop = true,
  slidesPerView = 1,
  spaceBetween = 20,
  breakpoints,
  navigation = true,
  navigationPosition = "top",
  pagination = true,
  centeredSlides = false,
  className = "",
  slideClassName = "",
  speed = 700,
}) {
  const autoId = useId().replace(/:/g, "");
  const carouselId = id || autoId;
  const prevClass = `${carouselId}-prev`;
  const nextClass = `${carouselId}-next`;

  const modules = [Navigation, Pagination, Autoplay, A11y];
  if (effect === "fade") modules.push(EffectFade);
  if (effect === "creative") modules.push(EffectCreative);

  const slides = Array.isArray(children) ? children : [children];
  const navBtnClass =
    "w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-navy/12 bg-white/95 backdrop-blur-sm flex items-center justify-center text-navy hover:border-sky hover:bg-sky-soft/60 hover:text-sky transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2";

  const showTopNav = navigation && slides.length > 1 && navigationPosition === "top";
  const showBottomNav = navigation && slides.length > 1 && navigationPosition === "bottom";
  const showEdgeNav =
    navigation && slides.length > 1 && (navigationPosition === "edges" || navigationPosition === "sides");

  const swiperPb = pagination && slides.length > 1 && !showEdgeNav ? "!pb-[30px]" : "!pb-0";

  return (
    <div className={`relative group/carousel ${className}`}>
      {showTopNav && (
        <div className="hidden sm:flex absolute -top-14 right-0 gap-2 z-10 carousel-nav">
          <button type="button" className={`${prevClass} ${navBtnClass}`} aria-label="Previous slide">
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" className={`${nextClass} ${navBtnClass}`} aria-label="Next slide">
            <IconChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showEdgeNav && (
        <>
          <button
            type="button"
            className={`${prevClass} absolute left-0 top-[30%] -translate-y-1/2 z-30 ${navBtnClass}`}
            aria-label="Previous slide"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`${nextClass} absolute right-0 top-[30%] -translate-y-1/2 z-30 ${navBtnClass}`}
            aria-label="Next slide"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <Swiper
        modules={modules}
        effect={effect === "slide" ? undefined : effect}
        fadeEffect={effect === "fade" ? { crossFade: true } : undefined}
        creativeEffect={
          effect === "creative"
            ? {
                prev: { translate: ["-12%", 0, -1], opacity: 0.6 },
                next: { translate: ["12%", 0, -1], opacity: 0.6 },
              }
            : undefined
        }
        speed={speed}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        breakpoints={breakpoints}
        centeredSlides={centeredSlides}
        loop={loop && slides.length > 1}
        autoplay={autoplay && slides.length > 1 ? autoplay : false}
        navigation={
          navigation && slides.length > 1
            ? { prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }
            : false
        }
        pagination={
          pagination && slides.length > 1 && !showEdgeNav
            ? { clickable: true, dynamicBullets: true }
            : false
        }
        a11y={{
          enabled: true,
          prevSlideMessage: "Previous slide",
          nextSlideMessage: "Next slide",
          paginationBulletMessage: "Go to slide {{index}}",
        }}
        className={`carousel-swiper ${swiperPb}`}
      >
        {slides.map((child, i) => (
          <SwiperSlide key={i} className={`!h-auto ${slideClassName}`}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>

      {showBottomNav && (
        <div className="flex justify-center items-center gap-3 mt-5 carousel-nav-bottom">
          <button type="button" className={`${prevClass} ${navBtnClass}`} aria-label="Previous slide">
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" className={`${nextClass} ${navBtnClass}`} aria-label="Next slide">
            <IconChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
