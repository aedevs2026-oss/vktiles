import { pageHeaders, cta } from "@/content/data";
import { getBusiness, getContactConfig } from "@/lib/site-content";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import ContactForm from "@/components/forms/ContactForm";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Contact",
  description:
    "Contact VK Tiles & Granites — visit our Bommidi showroom, call us or send an enquiry for tiles, granite and marble.",
};

export default function ContactPage() {
  const header = pageHeaders.contact;
  const business = getBusiness();
  const { contact, businessHours } = getContactConfig();

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} image={header.image} />

      <section className="section-padding bg-white" aria-label="Contact information">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <SectionTitle
                eyebrow={contact.eyebrow}
                title={contact.title || "Send an Enquiry"}
                subtitle={contact.subtitle}
                align="left"
                className="mb-8"
              />
              <ContactForm inquiryTypes={contact.inquiryTypes} />
            </div>

            <div>
              <SectionTitle
                eyebrow="Visit Us"
                title="Showroom & Contact Details"
                subtitle="Walk into our Bommidi showroom or reach us by phone, email or WhatsApp."
                align="left"
                className="mb-8"
              />

              <div className="space-y-6">
                <div className="bg-background p-6">
                  <h3 className="font-display text-lg text-dark mb-2">Address</h3>
                  <p className="text-gray text-sm leading-relaxed">{business.address}</p>
                  <Button href={business.mapLink} variant="outline" size="sm" external className="mt-4">
                    Get Directions
                  </Button>
                </div>

                <div className="bg-background p-6">
                  <h3 className="font-display text-lg text-dark mb-2">Phone & Email</h3>
                  <p className="text-gray text-sm mb-1">
                    <a href={`tel:${business.phoneRaw}`} className="hover:text-gold transition-colors">
                      {business.phone}
                    </a>
                  </p>
                  <p className="text-gray text-sm">
                    <a href={`mailto:${business.email}`} className="hover:text-gold transition-colors">
                      {business.email}
                    </a>
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button href={business.whatsapp} variant="whatsapp" size="sm" external>
                      WhatsApp
                    </Button>
                    <Button href={`tel:${business.phoneRaw}`} variant="outline" size="sm">
                      Call Now
                    </Button>
                  </div>
                </div>

                <div className="bg-background p-6">
                  <h3 className="font-display text-lg text-dark mb-3">Business Hours</h3>
                  <ul className="space-y-2">
                    {businessHours.map((item) => (
                      <li key={item.day} className="flex justify-between text-sm">
                        <span className="text-dark/80">{item.day}</span>
                        <span className="text-gray">{item.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-background" aria-label="Location map">
        <Container className="pb-16">
          <div className="aspect-[16/7] w-full overflow-hidden border border-dark/10">
            <iframe
              src={business.mapEmbed}
              title="VK Tiles & Granites location"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
