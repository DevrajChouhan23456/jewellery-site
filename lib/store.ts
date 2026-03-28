"use client";

import { create } from "zustand";
import {
  type CartItem,
  clearCartStorage,
  writeCartToStorage,
} from "@/lib/cart-storage";

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  getUniqueItemsCount: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  setItems: (items) => {
    set({ items });
    writeCartToStorage(items);
  },

  addItem: (item) => {
    const items = [...get().items];
    const existing = items.find((currentItem) => currentItem.id === item.id);

    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + (item.quantity ?? 1));
      existing.name = item.name || existing.name;
      existing.price = item.price ?? existing.price;
      existing.imageUrl = item.imageUrl ?? existing.imageUrl;
      existing.meta = item.meta ?? existing.meta;
    } else {
      items.push({
        ...item,
        quantity: Math.max(1, Math.min(99, item.quantity ?? 1)),
      });
    }

    set({ items });
    writeCartToStorage(items);
  },

  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    set({ items });
    writeCartToStorage(items);
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    const items = get().items.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) }
        : item,
    );

    set({ items });
    writeCartToStorage(items);
  },

  openCart: () => set({ isOpen: true }),

  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    set({ items: [] });
    clearCartStorage();
  },

  getUniqueItemsCount: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),
}));
