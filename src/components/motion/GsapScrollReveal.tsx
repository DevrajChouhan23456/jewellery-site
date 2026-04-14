"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { gsap } from "@/components/motion/ensure-gsap";

/**
 * Scroll-linked reveal for top-level column children (e.g. product details grid).
 */
export function GsapScrollReveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const els = ref.current.querySelectorAll(":scope > *");
      if (els.length === 0) return;
      gsap.from(els, {
        opacity: 0,
        y: 26,
        duration: 0.52,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
