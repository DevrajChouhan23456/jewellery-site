"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

import AddToCartButton from "@/components/add-to-cart-button";
import { CountdownTimer, useFomoTimer } from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { formatMaterialLabel } from "@/lib/brand-copy";
import { cn } from "@/lib/utils";

type ProductInfoProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    material: string;
    sizes: string[];
  };
};

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [wishlisted, setWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const showTimer = useFomoTimer();

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await fetch(
          `/api/wishlist/check?productId=${product.id}`,
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setWishlisted(data.inWishlist);
      } catch {
        // Ignore wishlist read errors and keep the default state.
      }
    };

    void checkWishlist();
  }, [product.id]);

  const toggleWishlist = async () => {
    if (loadingWishlist) {
      return;
    }

    const nextState = !wishlisted;
    setWishlisted(nextState);
    setLoadingWishlist(true);

    try {
      const response = await fetch(
        nextState ? "/api/wishlist/add" : "/api/wishlist/remove",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update wishlist");
      }

      toast.success(nextState ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
      setWishlisted(!nextState);
      toast.error("Unable to update wishlist right now");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const assuranceItems = [
    {
      icon: ShieldCheck,
      title: `${formatMaterialLabel(product.material)} finish`,
      description: "Quality-checked styling with secure order validation.",
    },
    {
      icon: Truck,
      title: "Careful delivery",
      description: "Fast doorstep delivery across India for prepaid orders.",
    },
    {
      icon: Sparkles,
      title: "Gift-friendly packing",
      description: "Packed to feel polished and occasion-ready when it arrives.",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className="rounded-full border-stone-200 bg-stone-50 px-3 py-1 text-stone-700"
        >
          {selectedSize ? `Selected option: ${selectedSize}` : "Choose an option"}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-900"
        >
          Secure checkout enabled
        </Badge>
        {showTimer ? (
          <CountdownTimer className="border border-rose-200 bg-rose-500 px-3 py-1.5 text-xs font-semibold shadow-none" />
        ) : null}
        <motion.button
          type="button"
          onClick={toggleWishlist}
          disabled={loadingWishlist}
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          className={cn(
            "ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
            wishlisted
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
          )}
        >
          <Heart
            className={cn(
              "size-4",
              wishlisted ? "fill-current text-amber-700" : "text-stone-400",
            )}
          />
          {loadingWishlist
            ? "Updating"
            : wishlisted
              ? "Saved to wishlist"
              : "Save for later"}
        </motion.button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          product={{
            id: product.id,
            imageUrl: product.imageUrl,
            name: product.name,
            price: product.price,
          }}
          label="Add to Bag"
          className="h-12 rounded-full border border-stone-200 bg-white text-stone-950 shadow-[0_20px_45px_-30px_rgba(28,25,23,0.22)] hover:bg-stone-100"
        />

        <AddToCartButton
          product={{
            id: product.id,
            imageUrl: product.imageUrl,
            name: product.name,
            price: product.price,
          }}
          label="Buy Now"
          openCartOnSuccess={false}
          redirectToCheckout
          className="h-12 rounded-full border border-amber-200 bg-[linear-gradient(135deg,#fff6df_0%,#f4d79f_48%,#e4b86a_100%)] text-stone-950 shadow-[0_24px_48px_-30px_rgba(180,130,45,0.45)] hover:border-amber-300 hover:bg-[linear-gradient(135deg,#fff7e4_0%,#f1cf8a_50%,#ddb160_100%)]"
        />
      </div>

      <p className="text-sm leading-6 text-stone-500">
        Buy Now takes you directly to checkout so you can confirm address,
        payment, and gifting notes without an extra step.
      </p>

      <a
        href="#details"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 underline-offset-4 transition hover:text-amber-950 hover:underline"
      >
        Scroll to full product details
        <ChevronDown className="size-4 opacity-80" aria-hidden />
      </a>

      <div className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Size and fit
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Pick a starting option. We can confirm finer fit details during checkout.
            </p>
          </div>
          <p className="text-xs font-medium text-stone-500">
            Need a sizing note? Add it at checkout.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {product.sizes.map((sizeOption) => {
            const isSelected = sizeOption === selectedSize;

            return (
              <button
                key={sizeOption}
                type="button"
                onClick={() => setSelectedSize(sizeOption)}
                className={cn(
                  "rounded-[1rem] border px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                  isSelected
                    ? "border-stone-950 bg-stone-950 text-white shadow-[0_18px_42px_-34px_rgba(28,25,23,0.8)]"
                    : "border-white bg-white text-stone-700 hover:-translate-y-0.5 hover:border-amber-300 hover:text-stone-950 hover:shadow-[0_18px_42px_-34px_rgba(28,25,23,0.3)]",
                )}
              >
                <span className="block">{sizeOption}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    isSelected ? "text-stone-300" : "text-stone-500",
                  )}
                >
                  Ready to style
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {assuranceItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-stone-200/80 bg-white/90 p-4 shadow-[0_18px_50px_-40px_rgba(28,25,23,0.28)]"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-950 text-white">
                <Icon className="size-4" />
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-950">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
