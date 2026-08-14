"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import GsapProvider from "@/components/ui/GsapProvider";

export default function ConditionalSiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <GsapProvider>
      <main className="flex-1">{children}</main>
      <Footer />
    </GsapProvider>
  );
}
