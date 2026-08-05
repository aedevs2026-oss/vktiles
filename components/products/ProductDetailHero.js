import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import Container from "@/components/layout/Container";

export default function ProductDetailHero({ product, breadcrumbs, categoryLabel }) {
  return (
    <section
      className="relative overflow-hidden bg-navy min-h-[220px] md:min-h-[260px] flex items-end"
      aria-label="Product header"
    >
      {product.image && (
        <div className="absolute inset-0 opacity-35">
          <AppImage
            src={product.image}
            alt=""
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
        </div>
      )}
      <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-10 py-8 md:py-10">
        <nav className="text-sm text-white/60 mb-4" aria-label="Breadcrumb">
          {breadcrumbs.map((item, i) => (
            <span key={item.label}>
              {i > 0 && <span className="mx-2 text-white/30">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-sky-bright transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/90">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <p className="text-sky-bright text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
          {product.brand} · {categoryLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white text-balance max-w-4xl leading-tight">
          {product.name}
        </h1>
        <div className="flex flex-wrap gap-2 mt-5">
          {product.size && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs border border-white/15">
              {product.size}
            </span>
          )}
          {product.finish && (
            <span className="px-3 py-1 rounded-full bg-sky/25 text-sky-bright text-xs border border-sky/30">
              {product.finish}
            </span>
          )}
          {product.collection && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
              {product.collection}
            </span>
          )}
        </div>
      </Container>
    </section>
  );
}
