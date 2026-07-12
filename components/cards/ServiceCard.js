import Image from "next/image";
import Link from "next/link";

export default function ServiceCard({ service }) {
  return (
    <article className="group bg-white card-hover overflow-hidden">
      <Link href={`/services#${service.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="p-6">
          <h3 className="font-display text-xl text-dark group-hover:text-gold transition-colors mb-3">
            {service.title}
          </h3>
          <p className="text-gray text-sm leading-relaxed">{service.description}</p>
        </div>
      </Link>
    </article>
  );
}
