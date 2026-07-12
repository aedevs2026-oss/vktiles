import Image from "next/image";
import Link from "next/link";

export default function GalleryCard({ item }) {
  return (
    <article className="group relative overflow-hidden card-hover">
      <Link href="/gallery" className="block">
        <div className="relative aspect-[4/3]">
          <Image
            src={item.thumb || item.image}
            alt={item.caption}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <p className="text-white text-sm font-medium">{item.caption}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
