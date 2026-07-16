import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/products";
import { business, cta } from "@/content/data";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/cards/ProductCard";
import CTA from "@/components/sections/CTA";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description || `${product.name} — ${product.collection} collection at VK Tiles & Granites.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);
  const gallery = product.images?.length ? product.images : [product.image].filter(Boolean);

  return (
    <>
      <section className="bg-white border-b border-navy/8">
        <Container className="py-4 text-sm text-gray">
          <Link href="/products" className="hover:text-sky transition-colors">
            Products
          </Link>
          <span className="mx-2 text-navy/30">/</span>
          <Link
            href={`/products?collection=${product.collectionSlug}`}
            className="hover:text-sky transition-colors"
          >
            {product.collection}
          </Link>
          <span className="mx-2 text-navy/30">/</span>
          <span className="text-navy">{product.name}</span>
        </Container>
      </section>

      <section className="section-padding bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            <div>
              <div className="relative aspect-square overflow-hidden bg-sky-soft/40 mb-4">
                {gallery[0] ? (
                  <Image
                    src={gallery[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : null}
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {gallery.slice(0, 4).map((src) => (
                    <div key={src} className="relative aspect-square overflow-hidden bg-sky-soft/30">
                      <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sky text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                {product.brand} · {product.collection}
              </p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-navy mb-4">
                {product.name}
              </h1>
              <p className="text-gray leading-relaxed mb-8">{product.description}</p>

              <dl className="grid sm:grid-cols-2 gap-4 mb-8 text-sm">
                <div className="bg-background p-4">
                  <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">Finish</dt>
                  <dd className="text-navy font-medium">{product.finishes?.join(", ") || product.finish || "—"}</dd>
                </div>
                <div className="bg-background p-4">
                  <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">Look & Feel</dt>
                  <dd className="text-navy font-medium">{product.lookFeel || "—"}</dd>
                </div>
                <div className="bg-background p-4">
                  <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">Colors</dt>
                  <dd className="text-navy font-medium">{product.colors?.join(", ") || "—"}</dd>
                </div>
                <div className="bg-background p-4">
                  <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">Application</dt>
                  <dd className="text-navy font-medium">{product.application?.join(", ") || "—"}</dd>
                </div>
                <div className="bg-background p-4 sm:col-span-2">
                  <dt className="text-[10px] uppercase tracking-wider text-gray mb-1">Sizes</dt>
                  <dd className="text-navy font-medium">{product.sizes?.join(" · ") || product.size || "—"}</dd>
                </div>
              </dl>

              {product.features?.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-xl text-navy mb-3">Features</h2>
                  <ul className="space-y-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-gray">
                        <span className="text-sky mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/contact" size="lg">
                  Enquire Now
                </Button>
                <Button href={business.whatsapp} variant="whatsapp" size="lg" external>
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {product.packing?.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl md:text-3xl text-navy mb-2">Packing Details</h2>
              <p className="text-gray text-sm mb-6">
                Tiles per box and coverage area help you calculate exact order quantities.
              </p>
              <div className="overflow-x-auto border border-navy/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Size (mm)</th>
                      <th className="px-4 py-3 font-medium">Thickness</th>
                      <th className="px-4 py-3 font-medium">Tiles / Box</th>
                      <th className="px-4 py-3 font-medium">Coverage / Box</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.packing.map((row) => (
                      <tr key={`${row.size}-${row.thickness}`} className="border-t border-navy/8 odd:bg-background">
                        <td className="px-4 py-3 text-navy font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-gray">{row.size}</td>
                        <td className="px-4 py-3 text-gray">{row.thickness}</td>
                        <td className="px-4 py-3 text-gray">{row.tilesPerBox ?? "—"} pcs</td>
                        <td className="px-4 py-3 text-gray">
                          {row.coverageSqFt != null ? `${row.coverageSqFt} sq ft` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Container>
      </section>

      {related.length > 0 && (
        <section className="section-padding brand-mesh">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl text-navy mb-8">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTA data={cta} />
    </>
  );
}
