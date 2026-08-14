"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { business, navigation } from "@/content/data";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import AppImage from "@/components/ui/AppImage";

function isLinkActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  const path = href.split("#")[0];
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({ href, label, onNavigate, mobile = false }) {
  const pathname = usePathname();
  const active = isLinkActive(pathname, href);
  const isProducts = href === "/products";

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
          active
            ? "bg-sky-soft/90 text-navy border border-sky/25 shadow-sm shadow-sky/10"
            : "text-navy/80 hover:bg-navy/[0.04] border border-transparent"
        }`}
      >
        <span className="flex items-center gap-2.5">
          {isProducts && !active && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky/70" aria-hidden="true" />
          )}
          {label}
        </span>
        {active && (
          <span className="w-2 h-2 rounded-full bg-sky shadow-sm shadow-sky/40" aria-hidden="true" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative px-3.5 py-2 text-[13px] font-medium tracking-[0.03em] transition-colors duration-200 ${
        active
          ? "text-navy"
          : isProducts
            ? "text-sky hover:text-sky-bright"
            : "text-navy/60 hover:text-navy"
      }`}
    >
      {label}
      <span
        className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] rounded-full transition-all duration-300 ${
          active
            ? "bg-sky scale-x-100"
            : "bg-sky/50 scale-x-0 group-hover:scale-x-100 origin-left"
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-navy/10 shadow-[0_4px_24px_rgba(11,31,58,0.06)]"
          : "bg-white border-navy/10 shadow-[0_1px_0_rgba(11,31,58,0.04)]"
      }`}
    >
      <div className="hidden lg:block h-px bg-gradient-to-r from-transparent via-sky/35 to-transparent" />

      <div className="hidden md:block bg-navy text-white">
        <Container className="flex items-center justify-between py-2 text-xs gap-6">
          <p className="text-white/65 truncate max-w-[58%]">
            {business.tagline}
            <span className="hidden xl:inline text-white/35 mx-2">·</span>
            <span className="hidden xl:inline text-white/50">{business.address}</span>
          </p>
          <div className="flex items-center gap-5 shrink-0 text-white/75">
            <a
              href={`tel:${business.phoneRaw}`}
              className="inline-flex items-center gap-1.5 hover:text-sky-bright transition-colors"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {business.phone}
            </a>
            <span className="text-white/25" aria-hidden="true">|</span>
            <a
              href={business.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-sky-bright transition-colors"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </Container>
      </div>

      <Container>
        <nav
          className="flex items-center justify-between gap-4 lg:gap-6 h-[4.25rem] lg:h-[4.5rem]"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="flex items-center shrink-0 pr-4 lg:pr-8 lg:border-r border-navy/8"
            onClick={closeMenu}
          >
            <AppImage
              src="/logo.png"
              alt={business.name}
              width={200}
              height={72}
              priority
              wrapperClassName="inline-block"
              className="h-9 md:h-11 w-auto object-contain"
            />
          </Link>

          <ul className="hidden lg:flex items-center justify-center gap-1 flex-1 px-2">
            {navigation.map((link) => (
              <li key={link.href}>
                <NavItem href={link.href} label={link.label} />
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-2 shrink-0 pl-2 border-l border-navy/8">
            <Button href="/contact" variant="outline" size="sm">
              Enquire
            </Button>
            <Button href={business.whatsapp} variant="whatsapp" size="sm" external>
              WhatsApp
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-navy/10 text-navy hover:bg-navy/[0.04] active:scale-95 transition-all"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </nav>
      </Container>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/25 backdrop-blur-[3px] lg:hidden animate-fade-in"
            onClick={closeMenu}
            aria-label="Close menu overlay"
          />
          <div className="fixed top-[4.25rem] left-0 right-0 z-50 lg:hidden bg-white border-b border-navy/10 shadow-2xl shadow-navy/10 max-h-[calc(100vh-4.25rem)] overflow-y-auto animate-fade-up">
            <Container className="py-5">
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
                  Navigation
                </p>
                <a
                  href={`tel:${business.phoneRaw}`}
                  className="text-xs font-medium text-sky hover:text-sky-bright transition-colors"
                >
                  {business.phone}
                </a>
              </div>
              <ul className="flex flex-col gap-1">
                {navigation.map((link) => (
                  <li key={link.href}>
                    <NavItem
                      href={link.href}
                      label={link.label}
                      onNavigate={closeMenu}
                      mobile
                    />
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 gap-2.5 mt-6 pt-6 border-t border-navy/8">
                <Button href="/products" variant="secondary" size="md" className="w-full justify-center">
                  View Catalog
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button href="/contact" variant="outline" size="sm" className="w-full justify-center">
                    Enquire
                  </Button>
                  <Button href={business.whatsapp} variant="whatsapp" size="sm" external className="w-full justify-center">
                    WhatsApp
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </>
      )}
    </header>
  );
}
