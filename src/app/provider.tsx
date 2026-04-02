"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { fetchServerCart, mapApiCartToStoreItems } from "@/lib/cart-client";
import { readCartFromStorage } from "@/lib/cart-storage";
import { mergeCartAfterLogin } from "@/lib/mergeCart";
import { useCartStore } from "@/lib/store";
import SmoothScroll from "@/components/smooth-scroll";

function CartInitializer() {
  const { status } = useSession();

  useEffect(() => {
    useCartStore.getState().setItems(readCartFromStorage());
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (status === "authenticated") {
      void (async () => {
        await mergeCartAfterLogin();

        try {
          const cart = await fetchServerCart();

          if (!cancelled) {
            useCartStore.getState().setItems(mapApiCartToStoreItems(cart));
          }
        } catch {
          if (!cancelled) {
            useCartStore.getState().setItems(readCartFromStorage());
          }
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SmoothScroll />
      <CartInitializer />
      {children}
    </SessionProvider>
  );
}
