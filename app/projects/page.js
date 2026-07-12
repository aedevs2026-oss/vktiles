import { projects, pageHeaders, cta } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import ProjectCard from "@/components/cards/ProjectCard";

export const metadata = {
  title: "Projects",
  description:
    "Explore completed projects by VK Tiles & Granites — villas, apartments, hotels and commercial spaces across Tamil Nadu.",
};

export default function ProjectsPage() {
  const header = pageHeaders.projects;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Completed projects">
        <Container>
          <SectionTitle
            eyebrow="Our Work"
            title="Projects We've Delivered"
            subtitle="Residential villas, apartment complexes, hotels and commercial spaces across Tamil Nadu."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-background" aria-label="Project scope">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl text-dark mb-4">
              Your Next Project Starts Here
            </h2>
            <p className="text-gray text-base leading-relaxed">
              Whether it&apos;s a single-room renovation or a 50-unit apartment complex, we provide the
              same level of product quality, stock reliability and on-time delivery. Share your project
              details and our team will prepare a tailored quotation.
            </p>
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
