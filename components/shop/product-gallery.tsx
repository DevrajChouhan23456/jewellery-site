"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string | null;
}

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = images?.length ? images : ["/images/product-placeholder.svg"];
  const mainImage = safeImages[activeIndex] || safeImages[0];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">

      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:h-[650px] py-1 pr-1 pb-4 lg:pb-1">
        {safeImages.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveIndex(idx)}
            className={`relative size-[72px] lg:size-[90px] flex-shrink-0 rounded-2xl overflow-hidden border-2 transition ${
              idx === activeIndex
                ? "border-[#832729] shadow-md"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} ${idx}`}
              fill
              sizes="90px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative w-full aspect-[4/5] lg:h-[650px] rounded-3xl overflow-hidden bg-white shadow-sm border border-black/5 group">
        
        <Image
          key={mainImage}
          src={mainImage}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Icons */}
        <div className="absolute top-5 right-5 flex flex-col gap-3">
          <button className="p-3 rounded-full bg-white/70 hover:bg-white hover:scale-110 transition shadow">
            <Heart className="size-5" />
          </button>
          <button className="p-3 rounded-full bg-white/70 hover:bg-white hover:scale-110 transition shadow">
            <Share2 className="size-5" />
          </button>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-5 left-5 bg-[#832729] text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded">
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}
