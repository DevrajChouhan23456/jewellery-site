"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  Bell,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import { useCartStore } from "@/lib/store";
import { useCartMutations } from "@/lib/use-cart-mutations";

const FREE_SHIPPING_THRESHOLD = 5000;

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartDrawer() {
  const { items, isOpen, closeCart } = useCartStore();
  const {
    hasPendingMutations,
    isPending,
    removeCartItem,
    updateCartItemQuantity,
  } = useCartMutations();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const hasHighQuantityItems = items.some((item) => item.quantity >= 5);

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-full transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[430px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-stone-100 bg-[linear-gradient(135deg,#fffaf4_0%,#f6efe7_58%,#eef8fb_100%)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a1f24]">
                <ShoppingBag className="size-4" />
                Your Bag
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                Review before checkout
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {itemCount} item{itemCount === 1 ? "" : "s"} ready to move forward.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full border border-stone-200 bg-white p-2 text-stone-500 shadow-sm transition hover:text-stone-900"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Items
              </p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                {itemCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Subtotal
              </p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                {formatINR(subtotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {items.length > 0 ? (
            <>
              <div className="space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Truck className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-800">
                        {freeShippingRemaining === 0
                          ? "Free shipping unlocked"
                          : "Shipping progress"}
                      </p>
                      <p className="text-xs text-emerald-700">
                        {freeShippingRemaining === 0
                          ? "This bag already qualifies for free shipping."
                          : `${formatINR(freeShippingRemaining)} more for free shipping.`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-emerald-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    hasHighQuantityItems
                      ? "border-amber-200 bg-amber-50"
                      : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${
                        hasHighQuantityItems
                          ? "bg-amber-100 text-amber-700"
                          : "bg-white text-[#7a1f24]"
                      }`}
                    >
                      {hasHighQuantityItems ? (
                        <Bell className="size-5" />
                      ) : (
                        <Lock className="size-5" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          hasHighQuantityItems ? "text-amber-900" : "text-stone-900"
                        }`}
                      >
                        {hasHighQuantityItems
                          ? "Review larger quantities"
                          : "Protected checkout flow"}
                      </p>
                      <p
                        className={`text-xs ${
                          hasHighQuantityItems ? "text-amber-700" : "text-stone-600"
                        }`}
                      >
                        {hasHighQuantityItems
                          ? "A few pieces have higher quantities. Double-check before paying."
                          : "Bag totals stay validated all the way to payment."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.6rem] border border-[#eadccf] bg-white p-4 shadow-[0_18px_44px_-36px_rgba(28,25,23,0.45)]"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[1.2rem] border border-stone-100 bg-[#faf9f6]">
                        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7a1f24] shadow-sm">
                          Ready
                        </div>
                        <Image
                          src={item.imageUrl || "/images/product-placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 pr-4 text-sm font-semibold leading-snug text-gray-900">
                              {item.name}
                            </h3>
                            <div className="mt-2 text-sm font-semibold text-[#832729]">
                              {formatINR(item.price)}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={hasPendingMutations || isPending(item.id)}
                            onClick={() => removeCartItem(item.id)}
                            className="mt-0.5 flex-shrink-0 self-start text-gray-400 transition hover:text-[#832729]"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-1 py-1 shadow-sm">
                            <button
                              type="button"
                              disabled={hasPendingMutations || isPending(item.id)}
                              onClick={() =>
                                updateCartItemQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition hover:bg-stone-100"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold">
                              {isPending(item.id) ? "..." : item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={
                                hasPendingMutations || isPending(item.id) || item.quantity >= 99
                              }
                              onClick={() =>
                                updateCartItemQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition hover:bg-stone-100"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>

                          <div className="rounded-2xl border border-[#eadfce] bg-[#fffbf6] px-3 py-2 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                              Line Total
                            </p>
                            <p className="mt-1 text-sm font-semibold text-stone-950">
                              {formatINR(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-gray-500">
              <div className="grid size-20 place-items-center rounded-full bg-stone-50">
                <ShoppingBag className="size-10 stroke-[1.2] text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-stone-900">Your bag is empty.</p>
                <p className="mt-2 text-sm text-stone-500">
                  Add a few favourites and they will appear here.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full bg-[#832729] px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#6a1f22]"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="space-y-4 border-t border-stone-100 bg-[#faf9f6] p-6">
            <div className="rounded-[1.5rem] border border-white/80 bg-white px-4 py-4 shadow-sm">
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-stone-500">Subtotal</span>
                <span className="text-2xl font-semibold leading-none text-stone-950">
                  {formatINR(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                Taxes and shipping are finalised at checkout. Your order total stays
                protected until payment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-full bg-[#832729] py-3 text-sm font-semibold text-white transition hover:bg-[#6a1f22]"
              >
                Checkout
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="size-4" />
              Secure checkout with validated totals
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
