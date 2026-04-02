"use client";

import { useEffect, useState } from "react";
import AddToCartButton from "@/components/add-to-cart-button";

type StickyProductHeaderProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
};

export default function StickyProductHeader({ product }: StickyProductHeaderProps) {
  const [visible, setVisible] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 100) {
        setVisible(false);
      } else if (scrollY > prevScroll) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      setPrevScroll(scrollY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prevScroll]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 mx-auto flex items-center justify-between gap-4 bg-[#faf7f2]/95 px-4 py-3 shadow-xl shadow-[#00000010] backdrop-blur-sm transition-transform duration-400 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div>
        <p className="text-sm font-semibold text-[#1a1a1a]">{product.name}</p>
        <p className="text-sm text-[#8b6f47]">INR {product.price.toLocaleString("en-IN")}</p>
      </div>

      <div className="w-40">
        <AddToCartButton
          product={product}
          label="Add to Bag"
          openCartOnSuccess={false}
          className="w-full"
        />
      </div>
    </div>
  );
}
