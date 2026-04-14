"use client";

import { useEffect, useRef, useState } from "react";

import AddToCartButton from "@/components/add-to-cart-button";

type StickyProductHeaderProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
};

export default function StickyProductHeader({
  product,
}: StickyProductHeaderProps) {
  const [visible, setVisible] = useState(false);
  const previousScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY < 140) {
        setVisible(false);
      } else {
        setVisible(scrollY > previousScroll.current);
      }

      previousScroll.current = scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-3 z-40 px-3 transition-all duration-300 ease-out sm:top-4 sm:px-4 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[1.6rem] border border-white/80 bg-white/90 px-4 py-3 shadow-[0_24px_60px_-38px_rgba(28,25,23,0.42)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-950 sm:text-base">
            {product.name}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            INR {product.price.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block sm:w-36">
            <AddToCartButton
              product={product}
              label="Add to Bag"
              openCartOnSuccess={false}
              className="h-10 rounded-full border border-stone-200 bg-white text-stone-950 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.18)] hover:bg-stone-100"
            />
          </div>

          <div className="w-32 sm:w-36">
            <AddToCartButton
              product={product}
              label="Buy Now"
              openCartOnSuccess={false}
              redirectToCheckout
              className="h-10 rounded-full border border-amber-200 bg-[linear-gradient(135deg,#fff6df_0%,#f4d79f_48%,#e4b86a_100%)] text-stone-950 shadow-[0_22px_46px_-30px_rgba(180,130,45,0.42)] hover:border-amber-300 hover:bg-[linear-gradient(135deg,#fff7e4_0%,#f1cf8a_50%,#ddb160_100%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
