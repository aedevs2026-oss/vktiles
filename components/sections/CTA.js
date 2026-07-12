import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

export default function CTA({ data }) {
  return (
    <section className="section-padding bg-dark relative overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6 text-balance">
            {data.title}
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10">
            {data.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={data.primary.href} size="lg">
              {data.primary.label}
            </Button>
            <Button href={data.secondary.href} variant="outline" size="lg" className="!text-white !border-white/50 hover:!bg-white hover:!text-dark">
              {data.secondary.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
