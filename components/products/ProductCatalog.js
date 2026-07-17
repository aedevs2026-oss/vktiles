"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ProductCard from "@/components/cards/ProductCard";
import Container from "@/components/layout/Container";
import { matchesSizeFilter } from "@/lib/catalog-filters";
import {
  CATALOG_FILTER_CATEGORIES,
  formatSubcategoryLabel,
  getSizeOptionsForCategory,
  getDefaultCatalogSelection,
} from "@/content/product-categories";

const PAGE_SIZE = 24;

export default function ProductCatalog({ products, initialFilters = {} }) {
  const defaults = useMemo(
    () => getDefaultCatalogSelection(products, initialFilters),
    [products, initialFilters]
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(defaults.category);
  const [sizeKey, setSizeKey] = useState(defaults.sizeKey);
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const sizeOptions = useMemo(
    () => getSizeOptionsForCategory(products, category),
    [category, products]
  );

  useEffect(() => {
    if (!category || sizeOptions.length === 0) return;
    const valid = sizeOptions.some((o) => o.key === sizeKey);
    if (!valid) setSizeKey(sizeOptions[0].key);
  }, [category, sizeOptions, sizeKey]);

  const filtered = useMemo(() => {
    if (!category || !sizeKey) return [];

    const q = query.trim().toLowerCase();
    let result = products.filter((p) => {
      if (p.category !== category) return false;
      const matchSize =
        p.subcategory === sizeKey ||
        matchesSizeFilter(p.size, sizeKey) ||
        matchesSizeFilter(p.size, sizeOptions.find((s) => s.key === sizeKey)?.sampleSize);

      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.size || "").toLowerCase().includes(q) ||
        (p.finish || "").toLowerCase().includes(q) ||
        (p.pattern || "").toLowerCase().includes(q) ||
        (p.collection || "").toLowerCase().includes(q);

      return matchSize && matchQ;
    });

    if (sortBy === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") result = [...result].sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [products, category, sizeKey, query, sortBy, sizeOptions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectCategory = useCallback(
    (value) => {
      setCategory(value);
      const opts = getSizeOptionsForCategory(products, value);
      setSizeKey(opts[0]?.key || "");
      setPage(1);
      setCategoryOpen(false);
    },
    [products]
  );

  const selectSize = useCallback((key) => {
    setSizeKey(key);
    setPage(1);
  }, []);

  const resetAll = useCallback(() => {
    const { category: cat, sizeKey: size } = getDefaultCatalogSelection(products, {});
    setQuery("");
    setCategory(cat);
    setSizeKey(size);
    setPage(1);
    setSortBy("default");
  }, [products]);

  const categoryLabel =
    CATALOG_FILTER_CATEGORIES.find((c) => c.value === category)?.label || "Select category";

  return (
    <Container>
      <div className="max-w-3xl mx-auto mb-10 space-y-6">
        <div ref={dropdownRef} className="relative">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray mb-2 font-semibold">
            Category
          </p>
          <button
            type="button"
            onClick={() => setCategoryOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-navy/15 rounded-xl text-sm text-navy hover:border-sky transition-colors shadow-sm"
            aria-expanded={categoryOpen}
          >
            <span>{categoryLabel}</span>
            <svg
              className={`w-4 h-4 text-gray transition-transform ${categoryOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {categoryOpen && (
            <ul className="absolute z-20 mt-2 w-full bg-white border border-navy/10 rounded-xl shadow-xl shadow-navy/10 overflow-hidden">
              {CATALOG_FILTER_CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <button
                    type="button"
                    onClick={() => selectCategory(cat.value)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      category === cat.value
                        ? "bg-sky-soft text-sky font-medium"
                        : "text-navy hover:bg-background"
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {category && sizeOptions.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray mb-3 font-semibold">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => selectSize(opt.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    sizeKey === opt.key
                      ? "bg-navy text-white border-navy shadow-md"
                      : "bg-white text-navy border-navy/15 hover:border-sky hover:text-sky"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {category && sizeKey && (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-2">
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search in this range..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-navy/15 rounded-xl text-sm text-navy focus:outline-none focus:border-sky"
              />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray">
                <span className="font-semibold text-navy">{filtered.length}</span> products
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-navy/15 rounded-xl text-sm text-navy"
              >
                <option value="default">Default</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
              <button
                type="button"
                onClick={resetAll}
                className="text-xs text-gray hover:text-sky underline"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {category && sizeKey && (
        <>
          {pageItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray mb-2">No products match your search.</p>
              <button type="button" onClick={() => setQuery("")} className="text-sm text-sky underline">
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {pageItems.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 text-sm border border-navy/15 rounded-xl disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 text-sm border border-navy/15 rounded-xl disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
