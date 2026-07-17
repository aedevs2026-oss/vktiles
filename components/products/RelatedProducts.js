"use client";

import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/cards/ProductCard";

export default function RelatedProducts({ products, title = "Related Products" }) {
  if (!products?.length) return null;

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-navy mb-8">{title}</h2>
      <Carousel
        id="related"
        slidesPerView={1.15}
        spaceBetween={20}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        navigation
        pagination
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </Carousel>
    </div>
  );
}
