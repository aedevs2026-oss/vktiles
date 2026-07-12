import Image from "next/image";
import {
  about,
  aboutPage,
  statistics,
  whyChooseUs,
  processSteps,
  pageHeaders,
  cta,
} from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import StatsSection from "@/components/sections/StatsSection";
import WhyChooseSection from "@/components/sections/WhyChooseSection";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";

export const metadata = {
  title: "About Us",
  description:
    "Learn about VK Tiles & Granites — Tamil Nadu's trusted wholesale showroom for premium tiles, granite and marble since 2010.",
};

export default function AboutPage() {
  const header = pageHeaders.about;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />
      <StatsSection stats={statistics} />

      <section className="section-padding bg-white" aria-label="Our story">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={about.image}
                alt={about.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-gold hidden md:block" aria-hidden="true" />
            </div>
            <div>
              <SectionTitle
                eyebrow={about.eyebrow}
                title={about.title}
                subtitle={aboutPage.story}
                align="left"
                className="mb-8"
              />
              <ul className="space-y-4">
                {about.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dark/80">
                    <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-accent text-gold text-xs mt-0.5" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-background" aria-label="Our mission">
        <Container>
          <SectionTitle
            eyebrow="Our Mission"
            title="Building Beautiful Spaces, One Surface at a Time"
            subtitle={aboutPage.mission}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutPage.values.map((value) => (
              <article key={value.title} className="bg-white p-6 card-hover">
                <h3 className="font-display text-lg text-dark mb-2">{value.title}</h3>
                <p className="text-gray text-sm leading-relaxed">{value.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <WhyChooseSection items={whyChooseUs} />

      <section className="section-padding bg-white" aria-label="How we work">
        <Container>
          <SectionTitle
            eyebrow="Our Process"
            title="How It Works"
            subtitle="From your first showroom visit to delivery at your site — a seamless experience."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <article key={step.title} className="relative bg-background p-6 text-center">
                <span className="inline-flex w-10 h-10 items-center justify-center bg-gold text-white font-display text-lg mb-4">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg text-dark mb-2">{step.title}</h3>
                <p className="text-gray text-sm leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
