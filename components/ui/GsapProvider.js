"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, registerGsapPlugins } from "@/lib/gsap-client";

function isInsideReveal(node) {
  return Boolean(node.closest("[data-gsap-reveal]"));
}

export default function GsapProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    registerGsapPlugins();

    if (pathname?.startsWith("/admin")) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray("main section:not([data-gsap-skip])").forEach((section) => {
        if (isInsideReveal(section)) return;

        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          y: 36,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        });
      });

      ScrollTrigger.batch("[data-gsap-stagger] > *", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.from(batch, {
            opacity: 0,
            y: 24,
            stagger: 0.08,
            duration: 0.55,
            ease: "power2.out",
          }),
        once: true,
      });

      ScrollTrigger.batch(".card-hover", {
        start: "top 92%",
        onEnter: (batch) =>
          gsap.from(batch, {
            opacity: 0,
            y: 20,
            stagger: 0.06,
            duration: 0.5,
            ease: "power2.out",
          }),
        once: true,
      });
    });

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [pathname]);

  return children;
}
