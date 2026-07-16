"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/cards/ProductCard";
import Container from "@/components/layout/Container";

const PAGE_SIZE = 24;

export default function ProductCatalog({ products, categories, initialCollection = "" }) {
  const [collection, setCollection] = useState(initialCollection);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCollection = !collection || p.collectionSlug === collection || p.category === collection;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.collection || "").toLowerCase().includes(q) ||
        (p.colors || []).join(" ").toLowerCase().includes(q) ||
        (p.lookFeel || "").toLowerCase().includes(q);
      return matchCollection && matchQuery;
    });
  }, [products, collection, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeCollection(value) {
    setCollection(value);
    setPage(1);
  }

  return (
    <div>
      <Container>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between mb-10">
          <div className="flex-1 max-w-md">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-gray mb-2">Search</label>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, color, look…"
              className="w-full px-4 py-3 bg-white border border-navy/10 text-navy text-sm focus:outline-none focus:border-sky"
            />
          </div>
          <div className="flex-1 max-w-md">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-gray mb-2">Collection</label>
            <select
              value={collection}
              onChange={(e) => changeCollection(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-navy/10 text-navy text-sm focus:outline-none focus:border-sky"
            >
              <option value="">All collections</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray lg:pb-3">
            Showing <span className="text-navy font-medium">{filtered.length}</span> products
          </p>
        </div>

        {pageItems.length === 0 ? (
          <p className="text-center text-gray py-20">No products match your filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pageItems.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm border border-navy/15 disabled:opacity-40 hover:border-sky hover:text-sky"
            >
              Previous
            </button>
            <span className="text-sm text-gray">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm border border-navy/15 disabled:opacity-40 hover:border-sky hover:text-sky"
            >
              Next
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
