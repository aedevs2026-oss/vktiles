import { gallery, pageHeaders, cta, bannerCarouselImages } from "@/content/data";
import PageBanner from "@/components/sections/PageBanner";
import CTA from "@/components/sections/CTA";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/sections/SectionTitle";
import GalleryCard from "@/components/cards/GalleryCard";
import GalleryCarousel from "@/components/sections/GalleryCarousel";

export const metadata = {
  title: "Gallery",
  description:
    "View real installations of premium tiles, granite and marble from VK Tiles & Granites projects across Tamil Nadu.",
};

export default function GalleryPage() {
  const header = pageHeaders.gallery;

  return (
    <>
      <PageBanner title={header.title} subtitle={header.subtitle} images={bannerCarouselImages} />

      <section className="section-padding bg-white" aria-label="Photo gallery">
        <Container>
          <SectionTitle
            eyebrow="Visual Showcase"
            title="Installation Gallery"
            subtitle="Real homes, hotels and commercial spaces featuring our premium surfaces."
          />
          <GalleryCarousel items={gallery} />
        </Container>
      </section>

      <CTA data={cta} />
    </>
  );
}
