"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Particles } from "./ui/particles";

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
    title: "Fresh floral sparkle for modern celebration dressing",
    subtitle:
      "Soft gemstones, luminous gold, and statement silhouettes curated for the season.",
    ctaLabel: "Shop Floral Edit",
    ctaHref: "/shop/earrings",
  },
  {
    id: "fallback-2",
    imageUrl: "/images/sbg-men.webp",
    badge: "Golden Signatures",
    title: "Gold statements designed to look timeless from day to night",
    subtitle:
      "Discover refined classics, gifting icons, and elevated everyday essentials.",
    ctaLabel: "Explore Gold",
    ctaHref: "/shop/gold",
  },
  {
    id: "fallback-3",
    imageUrl: "/images/sbg-kids.webp",
    badge: "Diamond Edit",
    title: "Diamond jewellery that catches the light with quiet confidence",
    subtitle:
      "From pendants to rings, build a look that feels polished and personal.",
    ctaLabel: "Shop Diamond",
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
    if (displaySlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displaySlides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [displaySlides.length]);

  const currentSlide = displaySlides[safeActiveIndex];

  const previousSlide = () => {
    setActiveIndex((current) =>
      current === 0 ? displaySlides.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % displaySlides.length);
  };

  return (
    <section
      className="relative isolate overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(180deg, #fffdf9 0%, #f8f1e9 48%, #fffaf4 100%)",
      }}
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-200/70 via-rose-200/45 to-stone-200/60 blur-3xl" />

      <Particles
        className="pointer-events-none absolute inset-0 -z-10"
        quantity={120}
        ease={70}
        color="#8a6738"
        refresh
      />

      <div className="luxury-shell relative z-10">
        <div className="overflow-hidden rounded-[2.75rem] border border-white/80 bg-white/60 p-3 luxury-shadow backdrop-blur sm:p-4">
          <div className="relative min-h-[70vh] overflow-hidden rounded-[2.2rem] bg-stone-900">
            <Image
              src={currentSlide.imageUrl}
              alt={currentSlide.title ?? "Hero slide"}
              fill
              priority
              className="object-cover transition duration-700"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(20, 17, 15, 0.66) 0%, rgba(20, 17, 15, 0.34) 40%, rgba(20, 17, 15, 0.08) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%)",
              }}
            />

            <div className="relative flex min-h-[70vh] flex-col justify-between p-6 sm:p-8 lg:p-12">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  {currentSlide.badge ?? "Signature Edit"}
                </div>
                <h1
                  className="mt-6 max-w-3xl text-5xl leading-[0.98] text-white sm:text-6xl lg:text-7xl"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {currentSlide.title ??
                    "Discover modern jewellery for every moment"}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
                  {currentSlide.subtitle ??
                    "From everyday gold to celebration-ready diamonds, explore pieces that feel refined, expressive, and made to be remembered."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={currentSlide.ctaHref ?? "/shop/jewellery"}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
                  >
                    {currentSlide.ctaLabel ?? "Shop Now"}
                  </Link>
                  <Link
                    href="/shop/thejoydressing"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    View Collections
                  </Link>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid gap-3 sm:grid-cols-3">
                  {displaySlides.slice(0, 3).map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group overflow-hidden rounded-[1.6rem] border p-2 text-left backdrop-blur transition ${
                        index === safeActiveIndex
                          ? "border-white/40 bg-white/18"
                          : "border-white/15 bg-black/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="relative aspect-[1.1] overflow-hidden rounded-[1.2rem]">
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title ?? "Slide preview"}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                          {slide.badge ?? "Edit"}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm font-medium text-white">
                          {slide.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 self-start lg:self-end">
                  <button
                    type="button"
                    onClick={previousSlide}
                    className="inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 pb-2">
            {displaySlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2.5 rounded-full transition ${
                  index === safeActiveIndex
                    ? "w-10 bg-[var(--luxury-gold-deep)]"
                    : "w-2.5 bg-stone-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
