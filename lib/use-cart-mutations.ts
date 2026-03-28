"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import {
  mapApiCartToStoreItems,
  removeServerCartItem,
  updateServerCartQuantity as updateServerCartQuantityRequest,
} from "@/lib/cart-client";
import type { CartItem } from "@/lib/cart-storage";
import { useCartStore } from "@/lib/store";

function cloneCartItems(items: CartItem[]) {
  return items.map((item) => ({
    ...item,
    meta: item.meta ? { ...item.meta } : undefined,
  }));
}

export function useCartMutations() {
  const { status } = useSession();
  const removeItem = useCartStore((state) => state.removeItem);
  const setItems = useCartStore((state) => state.setItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [pendingProductIds, setPendingProductIds] = useState<string[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  const updatePendingProduct = (productId: string, isPending: boolean) => {
    setPendingProductIds((currentIds) => {
      if (isPending) {
        return currentIds.includes(productId) ? currentIds : [...currentIds, productId];
      }

      return currentIds.filter((id) => id !== productId);
    });
  };

  const syncItemChange = async (productId: string, nextQuantity: number) => {
    const previousItems = cloneCartItems(useCartStore.getState().items);

    if (nextQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, nextQuantity);
    }

    if (status !== "authenticated") {
      return;
    }

    updatePendingProduct(productId, true);
    setSyncError(null);

    try {
      const updatedCart =
        nextQuantity <= 0
          ? await removeServerCartItem(productId)
          : await updateServerCartQuantityRequest(productId, nextQuantity);

      setItems(mapApiCartToStoreItems(updatedCart));
    } catch (error) {
      setItems(previousItems);

      const message =
        error instanceof Error
          ? error.message
          : "We could not update your bag right now.";

      setSyncError(message);
      toast.error(message);
    } finally {
      updatePendingProduct(productId, false);
    }
  };

  return {
    hasPendingMutations: pendingProductIds.length > 0,
    isPending: (productId: string) => pendingProductIds.includes(productId),
    removeCartItem: (productId: string) => {
      if (pendingProductIds.length === 0) {
        void syncItemChange(productId, 0);
      }
    },
    syncError,
    updateCartItemQuantity: (productId: string, nextQuantity: number) => {
      if (pendingProductIds.length === 0) {
        void syncItemChange(productId, nextQuantity);
      }
    },
  };
}
