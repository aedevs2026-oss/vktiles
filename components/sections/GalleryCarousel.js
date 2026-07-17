"use client";

import Carousel from "@/components/ui/Carousel";
import GalleryCard from "@/components/cards/GalleryCard";

export default function GalleryCarousel({ items }) {
  return (
    <Carousel
      id="gallery-page"
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
      {items.map((item) => (
        <GalleryCard key={item.slug} item={item} />
      ))}
    </Carousel>
  );
}
