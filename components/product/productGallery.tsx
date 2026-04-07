"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductGalleryProps = {
  images: string[];
};

export default function ProductGallery({ images }: ProductGalleryProps) {
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

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {galleryImages.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="overflow-hidden rounded transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <Image
              src={img}
              alt="Product thumbnail"
              width={64}
              height={64}
              className="h-16 w-16 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="relative h-[500px] w-[500px] overflow-hidden rounded-2xl bg-[#fff8ef] shadow-inner">
        <Image
          key={activeImage}
          src={activeImage}
          alt="Selected product image"
          width={500}
          height={500}
          loading="lazy"
          className="h-full w-full object-cover transition duration-450 ease-in-out transform hover:scale-105"
          style={{ opacity: 1, transition: "opacity 0.4s ease" }}
        />
      </div>
    </div>
  );
}
