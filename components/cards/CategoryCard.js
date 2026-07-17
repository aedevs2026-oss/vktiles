import Image from "next/image";
import Link from "next/link";
import { BLUR_DATA_URL } from "@/lib/images";

export default function CategoryCard({ category }) {
  return (
    <article className="group relative overflow-hidden card-hover">
      <Link href={`/products?category=${category.dataCategory || category.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-navy/10">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover category-image-pan transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="absolute inset-0 image-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display text-xl text-white mb-1 group-hover:text-sky-bright transition-colors">
              {category.name}
            </h3>
            <p className="text-white/70 text-xs">{category.blurb}</p>
            {category.count != null && (
              <p className="text-sky-bright text-[10px] font-semibold uppercase tracking-wider mt-2">
                {category.count} Designs
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
