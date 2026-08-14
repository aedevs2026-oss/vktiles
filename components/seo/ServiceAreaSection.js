import { aeo, business } from "@/content/data";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";

export default function ServiceAreaSection() {
  return (
    <section
      className="section-padding bg-background border-t border-navy/8"
      aria-label="Service areas across Tamil Nadu"
      data-speakable
    >
      <Container>
        <SectionTitle
          eyebrow="Wholesale Coverage"
          title="Best Wholesale Tiles & Granites Across Tamil Nadu"
          subtitle={aeo.serviceAreaSummary}
        />

        <div className="grid lg:grid-cols-2 gap-10 mt-10">
          <article className="aeo-summary space-y-4">
            <h3 className="font-display text-xl text-navy">
              {aeo.entityName} — {aeo.entityType}
            </h3>
            <p className="text-gray text-sm leading-relaxed">{aeo.citationSummary}</p>
            <p className="text-gray text-sm leading-relaxed">
              Our showroom is at {business.address}. We serve homeowners, builders, architects and
              dealers in{" "}
              <strong className="text-navy font-medium">
                Dharmapuri, Salem, Kadathur, Bommidi
              </strong>{" "}
              and deliver wholesale tiles and granites across Tamil Nadu.
            </p>
          </article>

          <div>
            <h3 className="font-display text-lg text-navy mb-4">Cities & districts we serve</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {business.serviceAreas.map((area) => (
                <li
                  key={area}
                  className="text-sm text-navy/80 bg-white border border-navy/8 rounded-lg px-3 py-2"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {aeo.quickFacts.map((fact) => (
            <div key={fact.label} className="bg-white border border-navy/8 rounded-xl p-4">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky mb-1">
                {fact.label}
              </dt>
              <dd className="text-sm text-navy leading-relaxed">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
