import AppImage from "@/components/ui/AppImage";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";

export default function AboutPreview({ data }) {
  return (
    <section className="section-padding bg-white" aria-label="About preview">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <AppImage
              src={data.image}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-gold hidden md:block" aria-hidden="true" />
          </div>

          <div>
            <SectionTitle
              eyebrow={data.eyebrow}
              title={data.title}
              subtitle={data.description}
              align="left"
              className="mb-8"
            />
            <ul className="space-y-4 mb-8">
              {data.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-dark/80">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-accent text-gold text-xs mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button href={data.cta.href}>{data.cta.label}</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
