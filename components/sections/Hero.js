import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

export default function Hero({ data }) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden" aria-label="Hero">
      <Image
        src={data.image}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 hero-overlay" aria-hidden="true" />

      <Container className="relative z-10 py-24 md:py-32">
        <div className="max-w-3xl animate-fade-up">
          {data.eyebrow && (
            <p className="text-sky-bright text-xs font-semibold uppercase tracking-[0.28em] mb-5">
              {data.eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] text-balance mb-6">
            {data.title}
          </h1>
          <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-xl mb-10 animate-fade-up-delay">
            {data.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href={data.ctaPrimary.href} size="lg">
              {data.ctaPrimary.label}
            </Button>
            <Button
              href={data.ctaSecondary.href}
              variant="outline"
              size="lg"
              className="!text-white !border-white/50 hover:!bg-white hover:!text-navy"
            >
              {data.ctaSecondary.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
