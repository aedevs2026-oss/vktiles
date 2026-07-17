"use client";

import Carousel from "@/components/ui/Carousel";
import TestimonialCard from "@/components/cards/TestimonialCard";

export default function TestimonialsCarousel({ items }) {
  return (
    <Carousel
      id="testimonials-page"
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
      {items.map((testimonial) => (
        <TestimonialCard key={testimonial.name} testimonial={testimonial} />
      ))}
    </Carousel>
  );
}
