import Link from "next/link";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalSiteChrome from "@/components/layout/ConditionalSiteChrome";
import { seo, business } from "@/content/data";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: seo.defaultTitle,
  description: seo.defaultDescription,
  keywords: seo.keywords,
  openGraph: {
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    url: seo.siteUrl,
    siteName: business.name,
    images: [{ url: seo.ogImage, width: 1200, height: 630, alt: business.name }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    images: [seo.ogImage],
  },
  alternates: {
    canonical: seo.siteUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
      </body>
    </html>
  );
}
