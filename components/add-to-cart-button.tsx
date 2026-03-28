"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { useCartStore } from "@/lib/store";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToCart = async () => {
    if (isSubmitting) {
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    openCart();

    if (!session) {
      toast.success("Added to bag.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Added to bag locally, but we could not sync it to your account.",
        );
      }

      toast.success("Added to bag.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Added to bag locally, but we could not sync it to your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="flex flex-1 items-center justify-center rounded-full bg-[#832729] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#832729]/20 transition hover:bg-[#6a1f22] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Adding..." : "Add to Cart"}
    </button>
  );
}
