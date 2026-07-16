import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <article className="group bg-white card-hover overflow-hidden border border-navy/5">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-sky-soft/40">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : null}
          <span className="absolute top-4 left-4 bg-white/95 text-navy text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
            {product.availability || "In Stock"}
          </span>
          {product.label ? (
            <span className="absolute top-4 right-4 bg-sky text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
              {product.label}
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <p className="text-sky text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">
            {product.collection || product.brand}
          </p>
          <h3 className="font-display text-lg text-navy group-hover:text-sky transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-gray text-xs">
            <span>{product.finish || product.finishes?.[0] || "—"}</span>
            <span>{product.size || product.sizes?.[0] || "—"}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
