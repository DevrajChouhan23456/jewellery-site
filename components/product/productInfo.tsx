"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Check, Shield, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

import AddToCartButton from "@/components/add-to-cart-button";
import { CountdownTimer, useFomoTimer } from "@/components/countdown-timer";
import { cn } from "@/lib/utils";

type ProductInfoProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    sizes: string[];
  };
};

const WISHLIST_KEY = "luxury-wishlist-v1";

export default function ProductInfo({ product }: ProductInfoProps) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const showTimer = useFomoTimer();

  useEffect(() => {
    // Check if product is in wishlist via API
    const checkWishlist = async () => {
      try {
        const response = await fetch(`/api/wishlist/check?productId=${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setWishlisted(data.inWishlist);
        }
      } catch {
        // Ignore errors, default to false
      }
    };

    checkWishlist();
  }, [product.id]);

  const toggleWishlist = async () => {
    if (loading) return;

    // Instant feedback - update UI immediately
    const newWishlistedState = !wishlisted;
    setWishlisted(newWishlistedState);
    setFeedback(newWishlistedState ? "Added to wishlist!" : "Removed from wishlist");

    // Clear feedback after animation
    setTimeout(() => setFeedback(null), 2000);

    setLoading(true);

    try {
      const endpoint = newWishlistedState ? "/api/wishlist/add" : "/api/wishlist/remove";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        toast.success(newWishlistedState ? "Added to wishlist" : "Removed from wishlist");
      } else {
        // Revert on error
        setWishlisted(!newWishlistedState);
        setFeedback(null);
        toast.error("Unable to update wishlist right now");
      }
    } catch {
      // Revert on error
      setWishlisted(!newWishlistedState);
      setFeedback(null);
      toast.error("Unable to update wishlist right now");
    } finally {
      setLoading(false);
    }
  };

  const badgeItems = useMemo(
    () => [
      { icon: Shield, label: "100% Certified Jewellery" },
      { icon: Check, label: "Easy 30-Day Returns" },
      { icon: Truck, label: "Free Insured Shipping" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-lg border border-[#e5dfd5] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#8b6f47]">
          {size ? `Selected Size: ${size}` : "Select Size"}
        </div>

        {showTimer && (
          <CountdownTimer className="self-center" />
        )}

        <motion.button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: wishlisted ? 1.05 : 1,
            backgroundColor: wishlisted ? "rgba(139, 111, 71, 0.1)" : "white"
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ease-in-out overflow-hidden",
            wishlisted
              ? "border-[#8b6f47] bg-[#8b6f47]/10 text-[#8b6f47] shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:bg-[#f5ebdb]",
          )}
        >
          {/* Feedback animation overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  ✨
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ scale: wishlisted ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={cn("h-4 w-4", wishlisted ? "fill-[#8b6f47] text-[#8b6f47]" : "text-slate-400")} />
          </motion.div>
          <span className="relative z-10">
            {loading ? "Updating..." : wishlisted ? "Wishlisted" : "Add to Wishlist"}
          </span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <AddToCartButton
          product={{
            id: product.id,
            imageUrl: product.imageUrl,
            name: product.name,
            price: product.price,
          }}
          className="rounded-xl border border-[#e5dfd5] bg-[#8b6f47] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition duration-300 ease-in-out hover:scale-[1.02]"
        />

        <button
          type="button"
          onClick={toggleWishlist}
          className="rounded-xl border border-[#e5dfd5] bg-white px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
        >
          {wishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#e5dfd5] bg-[#faf7f2] p-4 text-sm text-[#1a1a1a]">
        {badgeItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[#4f4f4f]">
            <item.icon className="h-4 w-4 text-[#8b6f47]" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

