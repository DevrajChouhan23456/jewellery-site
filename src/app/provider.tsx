"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { SiteIdentityProvider } from "@/components/site-identity-provider";
import { fetchServerCart, mapApiCartToStoreItems } from "@/lib/cart-client";
import { readCartFromStorage } from "@/lib/cart-storage";
import { mergeCartAfterLogin } from "@/lib/mergeCart";
import type { SiteIdentity } from "@/lib/site-identity";
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
  initialSiteIdentity,
}: {
  children: React.ReactNode;
  initialSiteIdentity: SiteIdentity;
}) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus
      refetchWhenOffline={false}
    >
      <SiteIdentityProvider initialSiteIdentity={initialSiteIdentity}>
        <SmoothScroll />
        <CartInitializer />
        {children}
      </SiteIdentityProvider>
    </SessionProvider>
  );
}
