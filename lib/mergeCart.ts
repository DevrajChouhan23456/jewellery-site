import { fetchServerCart } from "@/lib/cart-client";
import { readCartFromStorage } from "@/lib/cart-storage";

export const mergeCartAfterLogin = async () => {
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
    itemsToMerge.map((item) =>
      fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to merge a cart item after login.");
        }
      }),
    ),
  );

  return !results.some((result) => result.status === "rejected");
};
