"use client";

import Carousel from "@/components/ui/Carousel";
import ProjectCard from "@/components/cards/ProjectCard";

export default function ProjectsCarousel({ items }) {
  return (
    <Carousel
      id="projects-page"
      slidesPerView={1.1}
      spaceBetween={20}
      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 4 },
      }}
      navigation
      pagination
    >
      {items.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </Carousel>
  );
}
