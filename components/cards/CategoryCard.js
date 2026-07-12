import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ category }) {
  return (
    <article className="group relative overflow-hidden card-hover">
      <Link href={`/categories#${category.slug}`} className="block">
        <div className="relative aspect-[3/4]">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 image-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display text-xl text-white mb-1 group-hover:text-gold transition-colors">
              {category.name}
            </h3>
            <p className="text-white/70 text-xs">{category.blurb}</p>
            {category.count && (
              <p className="text-gold text-[10px] font-semibold uppercase tracking-wider mt-2">
                {category.count}+ Designs
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
