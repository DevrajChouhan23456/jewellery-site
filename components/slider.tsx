"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { gsap } from "@/components/motion/ensure-gsap";
import { useSiteIdentity } from "@/components/site-identity-provider";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

type HeroSectionProps = {
  slides: HeroSlide[];
};

const fallbackSlides: HeroSlide[] = [
  {
    id: "fallback-1",
    imageUrl: "/images/sbg-women.jpg",
    badge: "Floral Party Edit",
    title: "Floral sparkle for party-ready styling",
    subtitle:
      "Lightweight statement pieces for brunch fits, mehendi nights, and festive dressing.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/earrings",
  },
  {
    id: "fallback-2",
    imageUrl: "/images/sbg-men.webp",
    badge: "Gold-Tone Layers",
    title: "Gold-tone layers without the real-gold price tag",
    subtitle:
      "Build festive looks with stackable bangles, layered chains, and occasion-ready sets.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/jewellery",
  },
  {
    id: "fallback-3",
    imageUrl: "/images/sbg-kids.webp",
    badge: "American Diamond Edit",
    title: "American Diamond shine for gifting and occasions",
    subtitle:
      "Choose polished pendants, rings, and earrings that bring instant sparkle to every event look.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/jewellery",
  },
];

export default function HeroSection({ slides }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const imageParallaxRef = useRef<HTMLDivElement>(null);
  const imageKenBurnsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const { siteIdentity } = useSiteIdentity();
  const displaySlides = useMemo(
    () => (slides.length > 0 ? slides : fallbackSlides),
    [slides],
  );

  const safeActiveIndex =
    displaySlides.length === 0 ? 0 : activeIndex % displaySlides.length;

  useEffect(() => {
    if (displaySlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displaySlides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [displaySlides.length]);

  const currentSlide = displaySlides[safeActiveIndex];

  useGSAP(
    () => {
      if (!rootRef.current || !imageParallaxRef.current) return;
      gsap.to(imageParallaxRef.current, {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (!imageKenBurnsRef.current) return;
      gsap.fromTo(
        imageKenBurnsRef.current,
        { scale: 1.06, autoAlpha: 0.88 },
        { scale: 1, autoAlpha: 1, duration: 1, ease: "power2.out" },
      );
    },
    { scope: rootRef, dependencies: [safeActiveIndex] },
  );

  useGSAP(
    () => {
      if (!headlineRef.current) return;
      const targets = headlineRef.current.querySelectorAll(
        "h2, p, h1, p, a",
      );
      if (targets.length === 0) return;
      gsap.from(targets, {
        opacity: 0,
        y: 26,
        duration: 0.55,
        stagger: 0.075,
        ease: "power2.out",
      });
    },
    { scope: headlineRef, dependencies: [safeActiveIndex] },
  );

  return (
    <section
      ref={rootRef}
      className="relative h-[500px] w-full overflow-hidden bg-[#fdfaf5] md:h-[650px] lg:h-[75vh]"
    >
      <div
        ref={imageParallaxRef}
        className="absolute inset-0 will-change-transform"
      >
        <div ref={imageKenBurnsRef} className="absolute inset-0">
          <Image
            src={currentSlide.imageUrl}
            alt={currentSlide.title ?? "Hero slide"}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-1000 ease-in-out"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/10 to-transparent" />
      </div>

      <div className="absolute left-6 top-6 z-20 md:left-10 md:top-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 drop-shadow-md md:text-xs">
          {siteIdentity.tagline}
        </span>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-end justify-center px-8 text-center md:px-24">
        <div
          ref={headlineRef}
          className="flex max-w-[430px] flex-col items-center"
        >
          <h2 className="mb-3 font-serif text-4xl leading-none tracking-widest text-[#fdf0d5] drop-shadow-lg md:text-[56px]">
            {siteIdentity.shortName}
          </h2>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-[#fdf0d5] drop-shadow-md md:text-sm">
            {siteIdentity.siteName}
          </p>

          <h1
            className="mb-8 text-5xl leading-tight text-white drop-shadow-xl md:text-[72px]"
            style={{
              fontFamily: 'minion-pro, "Times New Roman", serif',
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {currentSlide.title || "Party Edit"}
          </h1>

          <p className="mb-8 max-w-sm text-sm leading-7 text-white/90 drop-shadow-lg md:text-base">
            {currentSlide.subtitle ||
              "Artificial jewellery styles for gifting, festive dressing, and easy everyday glam."}
          </p>

          <Link
            href={currentSlide.ctaHref ?? "/shop/jewellery"}
            className="border border-white/40 bg-white/20 px-12 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md transition hover:bg-white/30 md:text-sm"
          >
            {currentSlide.ctaLabel || "Shop edit"}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-4">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rotate-45 transition-all duration-300 ${
              i === safeActiveIndex
                ? "size-2.5 bg-[#832729]"
                : "size-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
