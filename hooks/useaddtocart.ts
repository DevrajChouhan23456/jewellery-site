import { useState } from "react";
import toast from "react-hot-toast";
import { addServerCartItem } from "@/lib/cart-client";
import { useCartStore } from "@/lib/store";

export function useAddToCart() {
  const [loading, setLoading] = useState(false);
  const setItems = useCartStore((s) => s.setItems);

  const addToCart = async (productId: string) => {
    try {
      setLoading(true);

      await addServerCartItem(productId, 1);

      const res = await fetch("/api/cart");
      const cart = await res.json();

      setItems(cart);

      toast.success("Added to cart");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
}