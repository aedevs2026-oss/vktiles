import { generateGlobalJsonLd } from "@/lib/schema";

export default function SiteJsonLd() {
  const schemas = generateGlobalJsonLd();

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@id"] || JSON.stringify(schema["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
