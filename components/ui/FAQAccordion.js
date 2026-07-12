"use client";

import { useState } from "react";

export default function FAQAccordion({ items = [], limit }) {
  const [openIndex, setOpenIndex] = useState(0);
  const displayItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-dark/10 border border-dark/10 bg-white">
      {displayItems.map((item, index) => {
        const isOpen = openIndex === index;
        const question = item.question || item.q;
        const answer = item.answer || item.a;

        return (
          <div key={question}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-background transition-colors"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-dark text-sm md:text-base pr-4">
                {question}
              </span>
              <span className="shrink-0 text-gold text-xl leading-none" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-gray text-sm leading-relaxed">{answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
