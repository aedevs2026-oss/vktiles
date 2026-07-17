"use client";

import Link from "next/link";
import { useState } from "react";
import { productNav } from "@/content/catalog-nav";

function AccordionItem({ item, depth = 0, onNavigate }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = item.children?.length > 0;

  if (item.href && !hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block py-2.5 pl-4 text-sm text-navy/80 hover:text-sky"
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-navy"
        style={{ paddingLeft: `${depth * 12 + 16}px`, paddingRight: "16px" }}
      >
        {item.name}
        {hasChildren && (
          <svg
            className={`w-4 h-4 text-gray transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {open && hasChildren && (
        <div className="border-l border-navy/10 ml-4">
          {item.children.map((child) => (
            <AccordionItem key={child.slug} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductMobileMenu({ onClose }) {
  return (
    <div className="border-t border-navy/8 bg-white">
      <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-gray">Products</p>
      {productNav.map((item) => (
        <AccordionItem key={item.slug} item={item} onNavigate={onClose} />
      ))}
      <Link
        href="/products"
        onClick={onClose}
        className="block mx-4 my-4 py-3 text-center text-sm font-medium bg-navy text-white rounded-xl"
      >
        View All Products
      </Link>
    </div>
  );
}
