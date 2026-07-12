import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <article className="group bg-white card-hover overflow-hidden">
      <Link href="/projects" className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="p-6">
          <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">
            {project.location}
          </p>
          <h3 className="font-display text-xl text-dark group-hover:text-gold transition-colors mb-2">
            {project.title}
          </h3>
          <p className="text-gray text-sm leading-relaxed">{project.scope}</p>
        </div>
      </Link>
    </article>
  );
}
