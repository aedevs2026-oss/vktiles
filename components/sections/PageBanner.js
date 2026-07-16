import Image from "next/image";
import Container from "@/components/layout/Container";

export default function PageBanner({ title, subtitle, image }) {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-navy" aria-label="Page header">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 hero-overlay opacity-90" aria-hidden="true" />
        </>
      )}
      <Container className="relative z-10 text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="brand-line mx-auto mt-8" aria-hidden="true" />
      </Container>
    </section>
  );
}
