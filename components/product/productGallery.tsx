"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { gsap } from "@/components/motion/ensure-gsap";

import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
};

export default function ProductGallery({ images }: ProductGalleryProps) {
  const mainStageRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(() => {
    const uniqueImages = images.filter((image, index) => {
      return image && images.indexOf(image) === index;
    });

    return uniqueImages.length
      ? uniqueImages
      : ["/images/product-placeholder.svg"];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = Math.min(activeIndex, galleryImages.length - 1);
  const activeImage = galleryImages[safeActiveIndex];

  useGSAP(
    () => {
      if (!mainStageRef.current) return;
      gsap.fromTo(
        mainStageRef.current,
        { autoAlpha: 0.82, scale: 0.99 },
        { autoAlpha: 1, scale: 1, duration: 0.38, ease: "power2.out" },
      );
    },
    { scope: mainStageRef, dependencies: [safeActiveIndex, activeImage] },
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[92px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 xl:order-1 xl:flex-col xl:overflow-visible xl:pb-0">
        {galleryImages.map((img, index) => {
          const isActive = index === safeActiveIndex;

          return (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-[1.35rem] border bg-white/90 p-1.5 transition-all duration-300",
                isActive
                  ? "border-stone-950 shadow-[0_18px_45px_-35px_rgba(28,25,23,0.75)]"
                  : "border-stone-200/80 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_18px_45px_-35px_rgba(28,25,23,0.35)]",
              )}
              aria-label={`View image ${index + 1}`}
              aria-pressed={isActive}
            >
              <div className="relative h-18 w-18 overflow-hidden rounded-[1rem] bg-[linear-gradient(145deg,#fffaf1,#f4ece2)]">
                <Image
                  src={img}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>

      <MagicCard
        className="order-1 overflow-hidden rounded-[1.85rem] border border-white/75 bg-white/82 shadow-[0_28px_70px_-45px_rgba(28,25,23,0.38)]"
        gradientFrom="#d6a75c"
        gradientTo="#67e8f9"
        gradientColor="rgba(214,167,92,0.1)"
        gradientOpacity={0.18}
      >
        <div
          ref={mainStageRef}
          className="relative aspect-[4/4.7] overflow-hidden rounded-[inherit] bg-[linear-gradient(145deg,#fff9f1,#f6efe5,#eef8fb)]"
        >
          <div className="absolute left-[-8%] top-[-8%] size-40 rounded-full bg-amber-200/45 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-8%] size-44 rounded-full bg-cyan-200/45 blur-3xl" />

          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-2">
            <Badge className="rounded-full border-white/70 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-800 backdrop-blur">
              Studio view
            </Badge>
            <div className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur">
              {safeActiveIndex + 1}/{galleryImages.length}
            </div>
          </div>

          <Image
            key={activeImage}
            src={activeImage}
            alt="Selected product image"
            fill
            sizes="(max-width: 1280px) 100vw, 52vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            priority={safeActiveIndex === 0}
          />

          <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 rounded-full border border-white/70 bg-white/88 px-4 py-2 text-xs text-stone-600 backdrop-blur">
            <span className="inline-flex items-center gap-2 font-medium text-stone-700">
              <Sparkles className="size-3.5 text-amber-600" />
              Crafted finish close-up
            </span>
            <span className="hidden sm:inline">Tap thumbnails to switch</span>
          </div>
        </div>
      </MagicCard>
    </div>
  );
}
