"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { business, navigation } from "@/content/data";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = navigation.filter((l) => l.href !== "/products");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-navy/8">
      <div className="hidden md:block bg-navy text-white text-xs">
        <Container className="flex items-center justify-between py-2">
          <p className="text-white/70">{business.tagline} · {business.address}</p>
          <div className="flex items-center gap-6">
            <a href={`tel:${business.phoneRaw}`} className="hover:text-sky-bright transition-colors">
              {business.phone}
            </a>
            <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-sky-bright transition-colors">
              WhatsApp
            </a>
          </div>
        </Container>
      </div>

      <Container>
        <nav className="flex items-center justify-between py-3 md:py-4" aria-label="Main navigation">
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt={business.name}
              width={200}
              height={72}
              className="h-11 md:h-14 w-auto object-contain rounded-sm"
              priority
            />
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            <li>
              <Link href="/" className="px-3 py-2 text-sm text-navy/80 hover:text-sky transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="px-3 py-2 text-sm text-navy/80 hover:text-sky transition-colors">
                Products
              </Link>
            </li>
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="px-3 py-2 text-sm text-navy/80 hover:text-sky transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <Button href="/products" variant="secondary" size="sm">
              Catalog
            </Button>
            <Button href={business.whatsapp} variant="whatsapp" size="sm" external>
              WhatsApp
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-navy"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-navy/8 bg-white max-h-[80vh] overflow-y-auto">
          <Container className="py-4">
            <ul className="flex flex-col gap-1">
              <li>
                <Link href="/products" className="block px-3 py-3 text-navy font-medium" onClick={() => setOpen(false)}>
                  Products
                </Link>
              </li>
              {navLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-3 py-3 text-navy hover:text-sky transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-navy/8">
              <Button href="/products" variant="primary">View Catalog</Button>
              <Button href={business.whatsapp} variant="whatsapp" external>WhatsApp</Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
