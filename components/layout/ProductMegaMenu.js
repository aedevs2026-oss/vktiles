"use client";

import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { productNav, categoryIcons } from "@/content/catalog-nav";

function navSlugToCategory(slug) {
  if (slug === "floor-tiles") return "gvt-pgvt";
  return slug;
}

function NavIcon({ name }) {
  const d = categoryIcons[name] || categoryIcons.floor;
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PreviewProduct({ product }) {
  if (!product) return null;
  return (
    <motion.div
      key={product.slug}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="relative h-full min-h-[280px] rounded-2xl overflow-hidden bg-navy/5 shadow-lg shadow-navy/10"
    >
      {product.image && (
        <AppImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="400px"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="text-sky-bright text-[10px] uppercase tracking-[0.2em] mb-1">{product.collection}</p>
        <p className="font-display text-xl">{product.name}</p>
        <p className="text-white/70 text-sm mt-1">{product.size} · {product.finish}</p>
        <Link
          href={`/products/${product.slug}`}
          className="inline-block mt-3 text-xs font-semibold uppercase tracking-widest text-sky-bright hover:text-white"
        >
          View product →
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProductMegaMenu({ onClose, products = [] }) {
  const [activeCategory, setActiveCategory] = useState(productNav[0]?.slug);
  const [previewSlug, setPreviewSlug] = useState(null);

  const active = productNav.find((c) => c.slug === activeCategory) || productNav[0];
  const dataCategory = navSlugToCategory(active?.slug);

  const previewProduct =
    products.find((p) => p.slug === previewSlug) ||
    products.find((p) => p.category === dataCategory) ||
    products[0];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-[var(--nav-height,120px)] bottom-0 z-40 bg-navy/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-xl border-b border-navy/10 shadow-2xl shadow-navy/10 max-h-[calc(100vh-120px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-1">
              {productNav.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onMouseEnter={() => {
                    setActiveCategory(cat.slug);
                    setPreviewSlug(null);
                  }}
                  onFocus={() => setActiveCategory(cat.slug)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeCategory === cat.slug
                      ? "bg-navy text-white shadow-lg shadow-navy/20"
                      : "text-navy/70 hover:bg-sky-soft/60 hover:text-navy"
                  }`}
                >
                  <NavIcon name={cat.icon} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray mb-4">{active?.name}</p>
              {active?.href ? (
                <Link
                  href={active.href}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sky hover:text-sky-bright text-sm font-medium"
                >
                  View all {active.name} →
                </Link>
              ) : (
                <div className="space-y-6">
                  {(active?.children || []).map((child) => (
                    <div key={child.slug}>
                      {child.children ? (
                        <>
                          <p className="text-xs font-semibold text-navy mb-3 flex items-center gap-2">
                            {child.icon && <NavIcon name={child.icon} />}
                            {child.name}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {child.children.map((sub) => (
                              <Link
                                key={sub.slug}
                                href={sub.href}
                                onClick={onClose}
                                onMouseEnter={() => {
                                  const p = products.find(
                                    (pr) =>
                                      pr.subcategory === sub.slug &&
                                      pr.category === "gvt-pgvt"
                                  );
                                  if (p) setPreviewSlug(p.slug);
                                }}
                                className="px-4 py-3 rounded-xl border border-navy/8 text-sm text-navy hover:border-sky hover:bg-sky-soft/40 hover:text-sky transition-all duration-300"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={child.href}
                          onClick={onClose}
                          onMouseEnter={() => {
                            const p = products.find(
                              (pr) =>
                                pr.subcategory === child.slug &&
                                pr.category === dataCategory
                            );
                            if (p) setPreviewSlug(p.slug);
                          }}
                          className="block px-4 py-3 rounded-xl border border-navy/8 text-sm text-navy hover:border-sky hover:bg-sky-soft/40 transition-all duration-300"
                        >
                          {child.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray mb-4">Featured Preview</p>
              <PreviewProduct product={previewProduct} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
