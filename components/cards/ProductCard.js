import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <article className="group bg-white card-hover overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-accent/30">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <span className="absolute top-4 left-4 bg-white/95 text-dark text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
            {product.availability}
          </span>
        </div>
        <div className="p-5">
          <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">
            {product.brand}
          </p>
          <h3 className="font-display text-lg text-dark group-hover:text-gold transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-gray text-xs">
            <span>{product.finish}</span>
            <span>{product.size}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
