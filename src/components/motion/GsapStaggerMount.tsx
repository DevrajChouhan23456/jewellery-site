"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { gsap } from "@/components/motion/ensure-gsap";

/**
 * One-shot stagger on direct children — checkout / order success / track intro.
 */
export function GsapStaggerMount({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const kids = ref.current.children;
      if (kids.length === 0) return;
      gsap.from(kids, {
        opacity: 0,
        y: 20,
        duration: 0.48,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
