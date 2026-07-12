import Container from "@/components/layout/Container";

export default function StatsSection({ stats }) {
  return (
    <section className="bg-dark py-12 md:py-16" aria-label="Statistics">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl lg:text-5xl text-gold mb-2">
                {stat.value}
              </p>
              <p className="text-white/60 text-xs md:text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
