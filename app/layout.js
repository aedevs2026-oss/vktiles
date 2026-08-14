import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import ConditionalSiteChrome from "@/components/layout/ConditionalSiteChrome";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import { generateRootMetadata } from "@/lib/seo";

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

export const metadata = generateRootMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <SiteJsonLd />
        <NavbarWrapper />
        <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
      </body>
    </html>
  );
}
