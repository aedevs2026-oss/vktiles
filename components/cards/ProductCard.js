"use client";

import Link from "next/link";
import ProductImage from "@/components/products/ProductImage";
import { useState } from "react";

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const [wishlist, setWishlist] = useState(false);

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm shadow-navy/5 border border-navy/5 card-hover transition-all duration-300 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative aspect-[4/5] overflow-hidden bg-sky-soft/20">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {product.image ? (
            <ProductImage
              src={product.image}
              fallbackSrc={product.imageFallback}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5h16v14H4V5z" />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Overlay quick-view button */}
          <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="bg-white/95 text-navy text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg">
              Quick View
            </span>
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="bg-sky text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => setWishlist(!wishlist)}
          aria-label="Add to wishlist"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            wishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 text-navy/50 hover:text-red-500"
          }`}
        >
          <HeartIcon />
        </button>
      </div>

      <div className="p-5">
        <p className="text-sky text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
          {product.collection || product.category}
        </p>
        <h3 className="font-display text-base text-navy group-hover:text-sky transition-colors duration-300 mb-3 line-clamp-2 leading-snug">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 rounded-full bg-sky-soft text-sky font-medium">{product.finish || "—"}</span>
          <span className="text-gray">{product.size || "—"}</span>
        </div>
      </div>
    </article>
  );
}
