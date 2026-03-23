"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    badge: "Floral Bloom",
    title: "Floral Bloom",
    subtitle: "Fresh floral sparkle for modern celebration dressing",
    ctaLabel: "SHOP NOW",
    ctaHref: "/shop/earrings",
  },
  {
    id: "fallback-2",
    imageUrl: "/images/sbg-men.webp",
    badge: "Golden Signatures",
    title: "Golden Signatures",
    subtitle: "Discover refined classics, gifting icons, and elevated everyday essentials.",
    ctaLabel: "SHOP NOW",
    ctaHref: "/shop/gold",
  },
  {
    id: "fallback-3",
    imageUrl: "/images/sbg-kids.webp",
    badge: "Diamond Edit",
    title: "Diamond Edit",
    subtitle: "From pendants to rings, build a look that feels polished and personal.",
    ctaLabel: "SHOP NOW",
    ctaHref: "/shop/diamond",
  },
];

export default function HeroSection({ slides }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displaySlides = useMemo(
    () => (slides.length > 0 ? slides : fallbackSlides),
    [slides]
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

  return (
    <section className="relative w-full h-[500px] md:h-[650px] lg:h-[75vh] overflow-hidden bg-[#fdfaf5]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentSlide.imageUrl}
          alt={currentSlide.title ?? "Hero slide"}
          fill
          priority
          className="object-cover transition-transform duration-1000 ease-in-out"
        />
        {/* Subtle gradient overlay to ensure text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/10 to-transparent" />
      </div>

      {/* A TATA PRODUCT indicator */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/90 drop-shadow-md uppercase">
          A TATA PRODUCT
        </span>
      </div>

      {/* Content Overlay (Right side aligned) */}
      <div className="absolute inset-0 flex flex-col justify-center items-end text-center z-10 px-8 md:px-24">
        <div className="flex flex-col items-center max-w-[400px]">
          {/* Tanishq Logo Text */}
          <h2 className="text-[#fdf0d5] font-serif text-4xl md:text-[56px] leading-none tracking-widest mb-3 drop-shadow-lg">
            TANISHQ
          </h2>
          <p className="text-[#fdf0d5] tracking-[0.4em] text-xs md:text-sm mb-6 uppercase drop-shadow-md font-medium">
            PRESENTS
          </p>
          
          {/* Main Cursive Title */}
          <h1 
            className="text-white text-6xl md:text-[80px] leading-tight mb-10 drop-shadow-xl" 
            style={{ 
              fontFamily: 'minion-pro, "Times New Roman", serif', 
              fontStyle: 'italic',
              fontWeight: 400
            }}
          >
            {currentSlide.title || "Floral Bloom"}
          </h1>

          {/* CTA Button */}
          <Link
            href={currentSlide.ctaHref ?? "/shop/jewellery"}
            className="bg-white/20 backdrop-blur-md border border-white/40 text-white px-12 py-3.5 text-xs md:text-sm font-bold tracking-[0.15em] transition hover:bg-white/30 uppercase"
          >
            {currentSlide.ctaLabel || "SHOP NOW"}
          </Link>
        </div>
      </div>

      {/* Pagination dots (Diamonds) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 z-20">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rotate-45 ${
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
