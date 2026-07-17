import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  CATEGORY_LABELS,
} from "@/lib/products";
import { business, cta } from "@/content/data";
import { generateProductMetadata } from "@/lib/seo";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/schema";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import CTA from "@/components/sections/CTA";
import ProductGallery from "@/components/products/ProductGallery";
import PackingTable from "@/components/products/PackingTable";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductDetailActions, { ProductDetailDownloads } from "@/components/products/ProductDetailActions";

export const revalidate = 3600;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return generateProductMetadata(product);
}

function SpecCard({ label, value }) {
  if (!value || value === "—") return null;
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-navy/8 p-4 shadow-sm">
      <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">{label}</dt>
      <dd className="text-navy font-medium text-sm">{value}</dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 12);
  const gallery = product.images?.length ? product.images : [product.image].filter(Boolean);
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  const breadcrumbs = [
    { label: "Products", href: "/products" },
    {
      label: categoryLabel,
      href: `/products?category=${product.category}`,
    },
    {
      label: product.collection,
      href: `/products?category=${product.category}&collection=${encodeURIComponent(product.collection)}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbJsonLd(breadcrumbs)) }}
      />

      <section className="bg-white/80 backdrop-blur-sm border-b border-navy/8">
        <Container className="py-4 text-sm text-gray">
          {breadcrumbs.map((item, i) => (
            <span key={item.label}>
              {i > 0 && <span className="mx-2 text-navy/30">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-sky transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-navy">{item.label}</span>
              )}
            </span>
          ))}
        </Container>
      </section>

      <section className="section-padding bg-white pb-28 lg:pb-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <ProductGallery
              images={gallery}
              name={product.name}
              fallbackSrc={product.imageFallback || product.image}
            />

            <div className="lg:sticky lg:top-36 space-y-6">
              <div>
                <p className="text-sky text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  {product.brand} · {categoryLabel}
                </p>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-navy mb-4">
                  {product.name}
                </h1>
                <p className="text-gray leading-relaxed">{product.description}</p>
              </div>

              <dl className="grid sm:grid-cols-2 gap-3">
                <SpecCard label="Category" value={categoryLabel} />
                <SpecCard label="Size" value={product.size} />
                <SpecCard label="Finish" value={product.finishes?.join(", ") || product.finish} />
                <SpecCard label="Surface" value={product.surface} />
                <SpecCard label="Pattern" value={product.pattern} />
                <SpecCard label="Collection" value={product.collection} />
                <SpecCard label="Thickness" value={product.thickness} />
              </dl>

              {product.features?.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-navy mb-4">Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.features.map((f) => (
                      <div
                        key={f}
                        className="rounded-xl border border-sky/20 bg-sky-soft/30 px-4 py-3 text-sm text-navy"
                      >
                        <span className="text-sky mr-2">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.applications?.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-navy mb-3">Applications</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((app) => (
                      <span
                        key={app}
                        className="px-3 py-1.5 rounded-full bg-background text-xs text-navy border border-navy/8"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden lg:flex flex-col sm:flex-row gap-3 pt-2">
                <Button href="/contact" size="lg">
                  Enquire Now
                </Button>
                <Button href={business.whatsapp} variant="whatsapp" size="lg" external>
                  WhatsApp
                </Button>
              </div>

              <ProductDetailDownloads product={product} className="hidden lg:flex mt-2" />
            </div>
          </div>

          {product.packing?.length > 0 && (
            <div className="mt-16 rounded-2xl border border-navy/10 overflow-hidden shadow-sm">
              <div className="px-6 py-5 bg-background border-b border-navy/8">
                <h2 className="font-display text-2xl md:text-3xl text-navy">Packing Details</h2>
                <p className="text-gray text-sm mt-1">
                  Tiles per box, coverage and weight for accurate order planning.
                </p>
              </div>
              <PackingTable packing={product.packing} />
            </div>
          )}
        </Container>
      </section>

      {related.length > 0 && (
        <section className="section-padding brand-mesh">
          <Container>
            <RelatedProducts products={related} />
          </Container>
        </section>
      )}

      <ProductDetailActions product={product} />
      <CTA data={cta} />
    </>
  );
}
