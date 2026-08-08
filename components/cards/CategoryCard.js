import AppImage from "@/components/ui/AppImage";
import Link from "next/link";

export default function CategoryCard({ category }) {
  const href = `/products?category=${category.dataCategory || category.slug}`;

  return (
    <article className="group">
      <h3 className="font-display text-lg sm:text-xl text-navy mb-3 group-hover:text-sky transition-colors">
        <Link href={href}>{category.name}</Link>
      </h3>

      <Link href={href} className="block overflow-hidden card-hover">
        <div className="relative aspect-[3/4] bg-navy/5">
          {category.image ? (
            <AppImage
              src={category.image}
              alt={category.name}
              fill
              className="category-image-pan transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="absolute inset-0 image-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white/80 text-xs leading-relaxed">{category.blurb}</p>
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
