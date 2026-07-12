import Image from "next/image";
import Link from "next/link";

export default function BrandCard({ brand }) {
  return (
    <article className="group bg-white card-hover overflow-hidden text-center">
      <Link href={`/brands#${brand.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-accent/20">
          <Image
            src={brand.image}
            alt={brand.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg text-dark group-hover:text-gold transition-colors">
            {brand.name}
          </h3>
          <p className="text-gray text-xs mt-1">{brand.tagline}</p>
        </div>
      </Link>
    </article>
  );
}
