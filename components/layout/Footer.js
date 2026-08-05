import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import { business, footer, socialLinks, businessHours } from "@/content/data";
import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white" aria-label="Footer">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <AppImage
                src="/logo.png"
                alt={business.name}
                width={180}
                height={64}
                priority
                wrapperClassName="inline-block"
                className="h-12 w-auto object-contain rounded-sm mb-3"
              />
              <span className="block text-[10px] uppercase tracking-[0.22em] text-sky-bright/90">
                {business.tagline}
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {footer.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/70 hover:border-sky hover:text-sky transition-colors text-xs"
                >
                  {social.platform[0]}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sky text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footer.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 text-sm hover:text-sky transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sky text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {footer.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 text-sm hover:text-sky transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sky text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Contact
            </h3>
            <address className="not-italic text-white/60 text-sm space-y-3">
              <p>{business.address}</p>
              <p>
                <a href={`tel:${business.phoneRaw}`} className="hover:text-sky transition-colors">
                  {business.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${business.email}`} className="hover:text-sky transition-colors">
                  {business.email}
                </a>
              </p>
            </address>
            <div className="mt-5 space-y-2">
              {businessHours.map((item) => (
                <p key={item.day} className="text-white/50 text-xs">
                  <span className="text-white/70">{item.day}:</span> {item.hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {footer.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/40 text-xs hover:text-sky transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
