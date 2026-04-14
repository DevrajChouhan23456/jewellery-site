"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

import { addServerCartItem, mapApiCartToStoreItems } from "@/lib/cart-client";
import type { CartItem } from "@/lib/cart-storage";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  className?: string;
  label?: string;
  openCartOnSuccess?: boolean;
  redirectToCart?: boolean;
  redirectToCheckout?: boolean;
  product: {
    id: string;
    imageUrl: string;
    name: string;
    price: number;
  };
}

function cloneCartItems(items: CartItem[]) {
  return items.map((item) => ({
    ...item,
    meta: item.meta ? { ...item.meta } : undefined,
  }));
}

export default function AddToCartButton({
  className,
  label = "Add to Cart",
  openCartOnSuccess = true,
  redirectToCart = false,
  redirectToCheckout = false,
  product,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const setItems = useCartStore((state) => state.setItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldOpenCart =
    openCartOnSuccess && !redirectToCart && !redirectToCheckout;

  const navigateAfterSuccess = () => {
    if (redirectToCheckout) {
      router.push("/checkout");
      return;
    }

    if (redirectToCart) {
      router.push("/cart");
    }
  };

  const handleAddToCart = async () => {
    if (isSubmitting) {
      return;
    }

    const previousItems = cloneCartItems(useCartStore.getState().items);

    addItem({
      id: product.id,
      imageUrl: product.imageUrl,
      name: product.name,
      price: product.price,
    });

    if (shouldOpenCart) {
      openCart();
    }

    if (status !== "authenticated") {
      toast.success(
        redirectToCheckout
          ? "Added to bag. Continue with Google at checkout."
          : "Added to bag.",
      );

      navigateAfterSuccess();
      return;
    }

    setIsSubmitting(true);

    try {
      const cart = await addServerCartItem(product.id, 1);
      setItems(mapApiCartToStoreItems(cart));

      if (shouldOpenCart) {
        openCart();
      }

      if (redirectToCart || redirectToCheckout) {
        navigateAfterSuccess();
      } else {
        toast.success("Added to bag.");
      }
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not add this item to your bag right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleAddToCart}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      animate={
        isSubmitting
          ? {
              opacity: [1, 0.72, 1],
            }
          : {
              opacity: 1,
            }
      }
      transition={
        isSubmitting
          ? {
              duration: 0.9,
              ease: "easeInOut",
              repeat: Infinity,
            }
          : {
              duration: 0.2,
              ease: "easeOut",
            }
      }
      className={cn(
        "group relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_22px_48px_-30px_rgba(28,25,23,0.65)] transition-[transform,box-shadow,background-color,border-color,color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(28,25,23,0.5)] disabled:translate-y-0 disabled:shadow-none",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute inset-y-0 left-[-28%] w-1/2 rotate-12 bg-white/18 blur-2xl" />
      </span>
      <span className="relative z-10">
        {isSubmitting
          ? redirectToCheckout
            ? "Preparing Checkout"
            : redirectToCart
              ? "Opening Bag"
              : "Adding"
          : label}
      </span>
    </motion.button>
  );
}
