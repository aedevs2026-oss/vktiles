"use client";

import { useState } from "react";
import ProductImage from "@/components/products/ProductImage";

export default function ProductGallery({ images, name, fallbackSrc }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images?.length) return null;

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-sky-soft/20 cursor-zoom-in mb-4"
        onClick={() => setZoomed(!zoomed)}
      >
        <ProductImage
          src={images[active]}
          fallbackSrc={fallbackSrc}
          alt={`${name} — view ${active + 1}`}
          fill
          className={`object-cover transition-transform duration-700 ${zoomed ? "scale-150" : "scale-100"}`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-navy font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {zoomed ? "Click to zoom out" : "Click to zoom in"}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => { setActive(i); setZoomed(false); }}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                i === active ? "border-sky shadow-md shadow-sky/20" : "border-navy/10 hover:border-sky/50"
              }`}
            >
              <ProductImage
                src={src}
                fallbackSrc={fallbackSrc}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
