"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={cn(
        "flex flex-1 items-center justify-center rounded-full bg-[#832729] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#832729]/20 transition hover:bg-[#6a1f22] disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {isSubmitting
        ? redirectToCheckout
          ? "Preparing Checkout..."
          : redirectToCart
            ? "Opening Bag..."
          : "Adding..."
        : label}
    </button>
  );
}
