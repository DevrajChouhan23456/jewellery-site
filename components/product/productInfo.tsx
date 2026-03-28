"use client";

import { useState } from "react";

type ProductInfoProps = {
  product: {
    name: string;
    price: number;
    sizes: string[];
  };
};

export default function ProductInfo({ product }: ProductInfoProps) {
  const [size, setSize] = useState(product.sizes[0] ?? "");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{product.name}</h1>

      <p className="text-xl font-medium">INR {product.price}</p>

      <div>
        <p className="mb-2 text-sm">Select Size</p>
        <div className="flex gap-2">
          {product.sizes.map((itemSize) => (
            <button
              key={itemSize}
              type="button"
              onClick={() => setSize(itemSize)}
              className={`rounded border px-3 py-1 ${size === itemSize ? "bg-black text-white" : ""}`}
            >
              {itemSize}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" className="flex-1 rounded-xl bg-black py-3 text-white">
          Add to Cart
        </button>

        <button type="button" className="rounded-xl border px-4">
          Wishlist
        </button>
      </div>

      <div className="text-sm text-gray-500">
        100% Certified Gold
        <br />
        Easy Returns
        <br />
        Free Delivery
      </div>
    </div>
  );
}
