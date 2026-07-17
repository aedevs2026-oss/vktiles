"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { business } from "@/content/data";
import {
  buildShareText,
  downloadProductCatalog,
  downloadProductSpecification,
} from "@/lib/product-downloads";

function useProductShare(product) {
  const [shareHint, setShareHint] = useState("");

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = buildShareText(product, url);

    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
        setShareHint("Shared");
        setTimeout(() => setShareHint(""), 2500);
        return;
      } catch {
        /* cancelled or unsupported */
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setShareHint("Details copied");
    } else {
      setShareHint("Copy the page URL from your browser");
    }
    setTimeout(() => setShareHint(""), 2500);
  };

  return { share, shareHint };
}

const actionBtnClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-navy/15 text-sm text-navy hover:border-sky hover:text-sky transition-colors";

const actionBtnPrimaryClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-white text-sm hover:bg-navy-deep transition-colors";

export default function ProductDetailActions({ product }) {
  const { share, shareHint } = useProductShare(product);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-navy/10 bg-white/95 backdrop-blur-xl px-3 py-3 shadow-[0_-8px_30px_rgba(11,31,58,0.08)]">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={`${actionBtnClass} text-xs px-2`}
            onClick={() => downloadProductCatalog(product)}
          >
            Catalog
          </button>
          <button
            type="button"
            className={`${actionBtnClass} text-xs px-2`}
            onClick={() => downloadProductSpecification(product)}
          >
            Spec sheet
          </button>
          <button
            type="button"
            onClick={share}
            className={`${actionBtnPrimaryClass} text-xs px-2`}
            aria-label="Share product"
          >
            {shareHint || "Share"}
          </button>
        </div>
        <div className="flex gap-2">
          <Button href="/contact" size="sm" className="flex-1">
            Enquire
          </Button>
          <Button href={business.whatsapp} variant="whatsapp" size="sm" external className="flex-1">
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailDownloads({ product, className = "" }) {
  const { share, shareHint } = useProductShare(product);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => downloadProductCatalog(product)}
        >
          Download Catalog
        </button>
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => downloadProductSpecification(product)}
        >
          Download Specification
        </button>
        <button type="button" onClick={share} className={actionBtnPrimaryClass}>
          {shareHint || "Share"}
        </button>
      </div>
      <p className="text-xs text-gray max-w-lg">
        Catalog and specification files are generated from this product&apos;s details on your device — open
        the HTML file in your browser and use Print → Save as PDF if you need a PDF.
      </p>
    </div>
  );
}
