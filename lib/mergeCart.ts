import { addServerCartItem, fetchServerCart } from "@/lib/cart-client";
import { readCartFromStorage } from "@/lib/cart-storage";

let pendingMerge: Promise<boolean> | null = null;

async function performMergeCartAfterLogin() {
  const localCart = readCartFromStorage();

  if (!localCart.length) {
    return true;
  }

  const serverCart = await fetchServerCart().catch(() => null);
  const serverQuantities = new Map(
    (serverCart?.items ?? []).map((item) => [item.productId, item.quantity]),
  );

  const itemsToMerge = localCart
    .map((item) => ({
      productId: item.id,
      quantity: Math.max(0, item.quantity - (serverQuantities.get(item.id) ?? 0)),
    }))
    .filter((item) => item.quantity > 0);

  if (!itemsToMerge.length) {
    return true;
  }

  const results = await Promise.allSettled(
    itemsToMerge.map((item) => addServerCartItem(item.productId, item.quantity)),
  );

  return !results.some((result) => result.status === "rejected");
}

export async function mergeCartAfterLogin() {
  if (!pendingMerge) {
    pendingMerge = performMergeCartAfterLogin().finally(() => {
      pendingMerge = null;
    });
  }

  return pendingMerge;
}
