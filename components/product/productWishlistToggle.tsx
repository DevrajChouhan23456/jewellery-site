"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

const WISHLIST_KEY = "luxury-wishlist-v1";

type ProductWishlistToggleProps = {
  productId: string;
};

export default function ProductWishlistToggle({ productId }: ProductWishlistToggleProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await fetch(`/api/wishlist/check?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          setSaved(data.inWishlist);
        }
      } catch {
        // Ignore errors
      }
    };

    checkWishlist();
  }, [productId]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const endpoint = saved ? "/api/wishlist/remove" : "/api/wishlist/add";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setSaved(!saved);
        toast.success(saved ? "Removed from wishlist" : "Added to wishlist");
      } else {
        toast.error("Could not update wishlist.");
      }
    } catch {
      toast.error("Could not update wishlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition duration-300 ${
        saved ? "border-[#8b6f47] bg-[#8b6f47]/10 text-[#8b6f47]" : "border-slate-300 bg-white text-slate-700 hover:bg-[#f5ebdb]"
      }`}
    >
      <Heart className={saved ? "h-4 w-4 text-[#8b6f47]" : "h-4 w-4 text-slate-400"} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
