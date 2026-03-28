"use client";

export const CART_STORAGE_KEY = "cart.items.v1";
const LEGACY_CART_STORAGE_KEY = "cart";

export type CartItemMeta = {
  size?: string;
  weight?: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  qty?: number;
  imageUrl?: string | null;
  meta?: CartItemMeta;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function clampQuantity(quantity: number) {
  return Math.max(1, Math.min(99, quantity));
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  const quantityValue =
    typeof value.quantity === "number"
      ? value.quantity
      : typeof value.qty === "number"
        ? value.qty
        : 1;

  const meta =
    isRecord(value.meta)
      ? {
          size: typeof value.meta.size === "string" ? value.meta.size : undefined,
          weight:
            typeof value.meta.weight === "string" ? value.meta.weight : undefined,
        }
      : undefined;

  return {
    id: value.id,
    name: typeof value.name === "string" && value.name.trim() ? value.name : "Product",
    price: typeof value.price === "number" ? value.price : 0,
    quantity: clampQuantity(quantityValue),
    qty: clampQuantity(quantityValue),
    imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : undefined,
    meta,
  };
}

export function readCartFromStorage(): CartItem[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(CART_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]) {
  if (!canUseStorage()) {
    return;
  }

  const payload = items.map((item) => ({
    ...item,
    qty: item.quantity,
  }));

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
}

export function clearCartStorage() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
}
