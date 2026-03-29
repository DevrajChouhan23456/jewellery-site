import type { CartItem } from "@/lib/cart-storage";

type CartApiItem = {
  imageUrl: string | null;
  name: string;
  price: number;
  productId: string;
  quantity: number;
};

export type CartApiResponse = {
  cartId: string;
  items: CartApiItem[];
  totals: {
    subtotal: number;
    total: number;
  };
};

type CartApiError = {
  error?: string;
};

async function readResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | CartApiError | null;

  if (!response.ok) {
    throw new Error(
      (payload as CartApiError | null)?.error || "Unable to update your cart right now.",
    );
  }

  return payload as T;
}

export function mapApiCartToStoreItems(cart: CartApiResponse): CartItem[] {
  return cart.items.map((item) => ({
    id: item.productId,
    imageUrl: item.imageUrl,
    name: item.name,
    price: item.price,
    qty: item.quantity,
    quantity: item.quantity,
  }));
}

export async function fetchServerCart() {
  const response = await fetch("/api/cart", {
    method: "GET",
    cache: "no-store",
  });

  return readResponse<CartApiResponse>(response);
}

export async function addServerCartItem(productId: string, quantity = 1) {
  const response = await fetch("/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  return readResponse<CartApiResponse>(response);
}

export async function updateServerCartQuantity(productId: string, quantity: number) {
  const response = await fetch("/api/cart", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  return readResponse<CartApiResponse>(response);
}

export async function removeServerCartItem(productId: string) {
  const response = await fetch("/api/cart", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });

  return readResponse<CartApiResponse>(response);
}
