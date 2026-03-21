"use client";

import { TypingAnimation } from "./ui/typing-animation";
import { CardCarousel } from "./ui/card-carousel";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Particles } from "./ui/particles";

type SliderApiItem = {
  imageUrl?: string | null;
};

export default function HeroSection() {
  const [images, setImages] = useState<{ src: string; alt: string }[]>([]);
  const { resolvedTheme } = useTheme();
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000";

  // Fetch slider images from API
  useEffect(() => {
    fetch("/api/slider")
      .then((res) => res.json())
      .then((data: SliderApiItem[]) => {
        // Convert DB records into {src, alt} for CardCarousel
        const formatted = (data ?? [])
          .map((item) => item?.imageUrl)
          .filter((src): src is string => typeof src === "string" && src.length > 0)
          .map((src, idx) => ({ src, alt: `Slider Image ${idx + 1}` }));
        setImages(formatted);
      })
      .catch((err) => console.error("Failed to load slider images", err));
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-14 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200/60 via-fuchsia-200/40 to-amber-200/50 blur-3xl dark:from-sky-400/15 dark:via-fuchsia-400/10 dark:to-amber-400/10" />

      <Particles
        className="pointer-events-none absolute inset-0 -z-10"
        quantity={200}
        ease={80}
        color={color}
        refresh
      />

      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl flex-col items-center justify-center text-center">
        <TypingAnimation>
          WELCOME TO DOUGLAS HIGHER SECONDARY SCHOOL
        </TypingAnimation>
        <p className="mt-4 max-w-2xl text-balance text-base text-slate-600 dark:text-slate-300 sm:text-lg">
          Empowering students with knowledge, values, and skills to thrive in
          the modern world.
        </p>

        <div className="mt-10 w-full">
          <div className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-white/70 p-3 shadow-[0_30px_80px_-50px_rgba(2,6,23,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:p-4">
            {images.length > 0 ? (
              <CardCarousel
                images={images}
                autoplayDelay={2200}
                showPagination={true}
                showNavigation={true}
              />
            ) : (
              <div className="grid place-items-center py-16 text-sm text-slate-500 dark:text-slate-400">
                Loading slider...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
