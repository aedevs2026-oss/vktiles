"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap-client";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);

  useEffect(() => {
    registerGsapPlugins();
    const el = ref.current;
    if (!el) return;

    const tween = gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.65,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={className} data-gsap-reveal>
      {children}
    </Tag>
  );
}

export function RevealStagger({ children, className = "", stagger = 0.08 }) {
  const ref = useRef(null);

  useEffect(() => {
    registerGsapPlugins();
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll("[data-reveal-item]");
    if (!items.length) return;

    const tween = gsap.from(items, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [stagger]);

  return (
    <div ref={ref} className={className} data-gsap-reveal>
      {children}
    </div>
  );
}

export function RevealItem({ children, className = "" }) {
  return (
    <div className={className} data-reveal-item>
      {children}
    </div>
  );
}
