import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import Container from "@/components/layout/Container";

export default function PartnersStrip({ brands = [] }) {
  if (!brands.length) return null;

  return (
    <section className="py-10 md:py-12 border-y border-navy/8 bg-white" aria-label="Supply partners">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
          <div className="md:max-w-sm">
            <p className="text-sky text-[10px] font-bold uppercase tracking-[0.22em] mb-2">
              Supply network
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-navy leading-tight">
              Trusted manufacturer partners
            </h2>
            <p className="text-gray text-sm mt-2 leading-relaxed">
              We source through authorised channels for consistent quality and wholesale availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-5 flex-1 md:justify-end">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands#${brand.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-navy/8 bg-background/80 px-4 py-3 min-w-[min(100%,200px)] hover:border-sky/35 hover:bg-sky-soft/30 transition-all duration-300"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 ring-1 ring-navy/8">
                  <AppImage
                    src={brand.image}
                    alt=""
                    fill
                    className="group-hover:scale-105 transition-transform duration-500"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base text-navy group-hover:text-sky transition-colors">
                    {brand.name}
                  </p>
                  <p className="text-gray text-xs truncate">{brand.tagline}</p>
                </div>
              </Link>
            ))}
            <Link
              href="/brands"
              className="text-sm font-medium text-sky hover:text-sky-bright transition-colors px-2"
            >
              View partners →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
