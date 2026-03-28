"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
};

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [active, setActive] = useState(images[0] ?? "/images/product-placeholder.png");

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((img) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(img)}
            className="overflow-hidden rounded"
          >
            <Image
              src={img}
              alt="Product thumbnail"
              width={64}
              height={64}
              className="h-16 w-16 object-cover"
            />
          </button>
        ))}
      </div>

      <div className="relative">
        <Image
          src={active}
          alt="Selected product image"
          width={500}
          height={500}
          className="rounded-2xl transition hover:scale-105"
        />
      </div>
    </div>
  );
}
