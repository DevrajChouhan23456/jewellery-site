"use client";

import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { addServerCartItem, mapApiCartToStoreItems } from "@/lib/cart-client";
import type { CartItem } from "@/lib/cart-storage";
import { useCartStore } from "@/lib/store";

type WishlistGridItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
};

type WishlistGridProps = {
  items: WishlistGridItem[];
};

export default function WishlistGrid({ items: initialItems }: WishlistGridProps) {
  const [items, setItems] = useState(initialItems);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const setCartItems = useCartStore((state) => state.setItems);

  const visibleItems = useMemo(
    () => items.filter((item) => item.product !== null),
    [items],
  );

  const handleRemove = async (wishlistId: string) => {
    const previousItems = items;
    setItems((currentItems) => currentItems.filter((item) => item.id !== wishlistId));

    try {
      const response = await fetch("/api/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wishlistId }),
      });

      if (!response.ok) {
        throw new Error("Unable to remove item from wishlist.");
      }
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error instanceof Error ? error.message : "Unable to remove item from wishlist.",
      );
    }
  };

  const handleMoveToCart = async (wishlistItem: WishlistGridItem) => {
    if (!wishlistItem.product) {
      return;
    }

    const previousCartItems = useCartStore
      .getState()
      .items.map((item: CartItem) => ({
        ...item,
        meta: item.meta ? { ...item.meta } : undefined,
      }));

    addItem({
      id: wishlistItem.product.id,
      name: wishlistItem.product.name,
      price: wishlistItem.product.price,
      imageUrl: wishlistItem.product.images[0] ?? "/images/product-placeholder.svg",
    });
    openCart();

    try {
      const cart = await addServerCartItem(wishlistItem.product.id, 1);
      setCartItems(mapApiCartToStoreItems(cart));
    } catch (error) {
      setCartItems(previousCartItems);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to move this item to your cart.",
      );
      return;
    }

    await handleRemove(wishlistItem.id);
    toast.success("Moved item to cart.");
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {visibleItems.map((item) => {
        const imageUrl = item.product?.images[0] ?? "/images/product-placeholder.svg";

        return (
          <div
            key={item.id}
            className="group rounded-2xl border p-3 transition hover:shadow-xl"
          >
            <div className="relative">
              <Image
                src={imageUrl}
                alt={item.product?.name ?? "Wishlist item"}
                width={300}
                height={300}
                className="rounded-xl transition group-hover:scale-105"
              />

              <button
                type="button"
                onClick={() => void handleRemove(item.id)}
                className="absolute top-2 right-2 rounded-full bg-white p-2 shadow"
              >
                <Heart className="fill-red-500 text-red-500" />
              </button>
            </div>

            <h3 className="mt-3 text-sm font-medium">{item.product?.name}</h3>

            <p className="text-sm text-gray-500">
              INR {item.product?.price.toLocaleString("en-IN")}
            </p>

            <button
              type="button"
              onClick={() => void handleMoveToCart(item)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2 text-white"
            >
              <ShoppingBag size={16} />
              Move to Cart
            </button>
          </div>
        );
      })}
    </div>
  );
}
