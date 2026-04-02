"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

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
  const shouldOpenCart = openCartOnSuccess && !redirectToCart && !redirectToCheckout;

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
          ? "Added to bag. Sign in at checkout to continue."
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
      whileTap={{
        scale: 0.95,
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.2 }
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(139, 111, 71, 0.3)"
      }}
      animate={isSubmitting ? {
        scale: [1, 1.05, 1],
        transition: { duration: 0.3, repeat: Infinity }
      } : {}}
      className={cn(
        "relative flex flex-1 items-center justify-center rounded-full bg-[#8b6f47] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#8b6f47]/20 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#7a5d3f] disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden",
        className,
      )}
    >
      {/* Animated background particles */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      {/* Success burst animation */}
      <AnimatePresence>
        {!isSubmitting && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white/20"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="relative z-10">
        {isSubmitting
          ? redirectToCheckout
            ? "Preparing Checkout..."
            : redirectToCart
              ? "Opening Bag..."
            : "Adding..."
          : label}
      </span>
    </motion.button>
  );
}
