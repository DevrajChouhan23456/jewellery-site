"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";

import { cn } from "@/lib/utils";

interface CarouselProps {
  images: { src: string; alt: string }[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
  className,
}) => {
  const prevRef = React.useRef<HTMLButtonElement | null>(null);
  const nextRef = React.useRef<HTMLButtonElement | null>(null);

  const css = `
  .card-carousel .swiper {
    width: 100%;
    padding-bottom: 40px;
  }

  .card-carousel .swiper-3d .swiper-slide-shadow-left,
  .card-carousel .swiper-3d .swiper-slide-shadow-right {
    background-image: none;
  }

  .card-carousel .swiper-pagination {
    bottom: 0px;
  }

  .card-carousel .swiper-pagination-bullet {
    width: 7px;
    height: 7px;
    opacity: 1;
    background: rgba(148, 163, 184, 0.65);
    transition: transform 150ms ease, background 150ms ease, width 150ms ease;
  }

  .dark .card-carousel .swiper-pagination-bullet {
    background: rgba(148, 163, 184, 0.45);
  }

  .card-carousel .swiper-pagination-bullet-active {
    background: rgba(15, 23, 42, 0.9);
    width: 20px;
    border-radius: 999px;
  }

  .dark .card-carousel .swiper-pagination-bullet-active {
    background: rgba(241, 245, 249, 0.9);
  }
  `;
  return (
    <div className={cn("card-carousel relative w-full", className)}>
      <style>{css}</style>
      <Swiper
        spaceBetween={24}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2.2,
        }}
        pagination={showPagination ? { clickable: true } : false}
        navigation={showNavigation ? { enabled: true } : false}
        onBeforeInit={(swiper) => {
          if (!showNavigation) return;
          if (
            typeof swiper.params.navigation !== "boolean" &&
            swiper.params.navigation
          ) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="!w-[260px] sm:!w-[420px] lg:!w-[620px]"
          >
            <div
              className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 ring-1 ring-white/30 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:ring-white/10"
              style={{ boxShadow: "0 20px 60px -35px rgba(2, 6, 23, 0.45)" }}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 620px, (min-width: 640px) 420px, 260px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  priority={index === 0}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-60" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showNavigation ? (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/70 p-2 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-white/10 dark:bg-neutral-950/50 dark:text-slate-100 dark:hover:bg-neutral-950"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next slide"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/70 p-2 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-white/10 dark:bg-neutral-950/50 dark:text-slate-100 dark:hover:bg-neutral-950"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
};
