import { business } from "@/content/data";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";

export default function ContactPreview({ data }) {
  return (
    <section className="section-padding bg-white" aria-label="Contact preview">
      <Container>
        <SectionTitle
          eyebrow={data.eyebrow}
          title={data.title}
          subtitle={data.subtitle}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-background p-8 text-center card-hover">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-accent/50 text-gold mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-dark mb-3">Visit Showroom</h3>
            <p className="text-gray text-sm leading-relaxed mb-5">{business.address}</p>
            <Button href="/contact" variant="outline" size="sm">
              Get Directions
            </Button>
          </div>

          <div className="bg-background p-8 text-center card-hover">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-accent/50 text-gold mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-dark mb-3">Call Us</h3>
            <p className="text-gray text-sm leading-relaxed mb-5">{business.phone}</p>
            <Button href={`tel:${business.phoneRaw}`} variant="outline" size="sm">
              Call Now
            </Button>
          </div>

          <div className="bg-background p-8 text-center card-hover">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-accent/50 text-[#25D366] mb-5">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-dark mb-3">WhatsApp</h3>
            <p className="text-gray text-sm leading-relaxed mb-5">Quick enquiries & product photos</p>
            <Button href={business.whatsapp} variant="whatsapp" size="sm" external>
              Chat Now
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
