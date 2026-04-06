"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ChevronLeft, VolumeX, Share2 } from "lucide-react";
import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

type CuratedSectionProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function CuratedSection({ section, items }: CuratedSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-[42px] font-serif tracking-tight text-[#333] mb-2">
          {section.title || "Styling 101 With Diamonds"}
        </h2>
        {section.subtitle && (
          <p className="text-gray-500 text-base md:text-lg font-serif">
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="relative max-w-[1400px] mx-auto px-0 sm:px-12 lg:px-20">
        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition backdrop-blur-md"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition backdrop-blur-md"
        >
          <ChevronRight className="size-6" />
        </button>

        <div className="overflow-visible py-8" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4 items-center">
            {items.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className="relative min-w-0 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_25%] pl-4"
                >
                  <div
                    className={`relative w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-[20px] overflow-hidden ${
                      isActive 
                        ? "scale-110 z-10 shadow-2xl opacity-100" 
                        : "scale-90 opacity-60 hover:opacity-80"
                    }`}
                    style={{ aspectRatio: isActive ? "9/14" : "9/14" }}
                  >
                    <Image
                      src={item.image || "/images/sbg-women.jpg"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 25vw"
                      className="object-cover"
                    />
                    
                    {/* Shadow overlay for depth */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}

                    {/* Overlay for active slide */}
                    {isActive && (
                      <>
                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start text-white shadow-sm z-20">
                           <p className="text-[13px] font-medium w-2/3 leading-snug font-sans drop-shadow-md">
                             Your {item.title.toLowerCase()} sparkle, el...
                           </p>
                           <div className="flex gap-4">
                             <VolumeX className="size-[18px] drop-shadow-md cursor-pointer hover:opacity-80 transition" />
                             <Share2 className="size-[18px] drop-shadow-md cursor-pointer hover:opacity-80 transition" />
                           </div>
                        </div>
                        
                        {/* Gradient to make text readable */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                        <div className="absolute inset-x-0 bottom-5 px-5 z-20">
                          <Link href={item.link} className="flex items-center justify-between bg-[#222]/80 backdrop-blur-xl rounded-[14px] p-2.5 hover:bg-[#222] transition border border-white/10 group">
                            <div className="flex items-center gap-3">
                              <div className="relative size-10 rounded-lg overflow-hidden bg-white shadow-inner flex-shrink-0">
                                <Image
                                  src={item.image || "/images/sbg-women.jpg"}
                                  alt={item.title}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-white text-left flex-1 min-w-0 pr-2">
                                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-300 truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] font-serif leading-tight line-clamp-2 mt-0.5 text-gray-100">
                                  {item.subtitle || "Diamond Drop Earrings"}
                                </p>
                              </div>
                            </div>
                            <div className="size-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 transition group-hover:bg-white/20">
                              <ChevronRight className="size-3.5 text-white" />
                            </div>
                          </Link>
                          
                          {/* Progress bar simulation */}
                           <div className="flex gap-1 justify-center mt-4">
                             <div className="h-[2px] w-6 bg-white/30 rounded-full overflow-hidden">
                               <div className="h-full w-full bg-white rounded-full"></div>
                             </div>
                             <div className="h-[2px] w-6 bg-white/30 rounded-full"></div>
                             <div className="h-[2px] w-6 bg-white/30 rounded-full"></div>
                           </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
