"use client";

import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { Minus, Plus, ShoppingBag, X, Truck, Bell, Tag } from "lucide-react";

import { useCartStore } from "@/lib/store";
import { useCartMutations } from "@/lib/use-cart-mutations";

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
  const formattedSubtotal = new Intl.NumberFormat("en-IN").format(subtotal);

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      ) : null}

      <div
        className={`fixed top-0 right-0 z-[60] flex h-full w-full transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#faf9f6] p-6">
          <h2 className="flex items-center gap-2 text-xl font-serif tracking-wide text-gray-900">
            <ShoppingBag className="size-5" />
            Your Bag ({itemCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full bg-white p-2 text-gray-400 shadow-sm transition hover:text-gray-900 hover:shadow"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Psychological UX Elements */}
          {items.length > 0 && (
            <div className="space-y-3">
              {/* Free Shipping Progress */}
              {subtotal < 5000 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <Truck className="size-4" />
                    Add ₹{(5000 - subtotal).toLocaleString()} more for FREE shipping
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-emerald-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Low Stock Alert */}
              {items.some(item => item.quantity >= 5) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <Bell className="size-4" />
                    Only a few items left in stock
                  </div>
                </div>
              )}

              {/* Savings Highlight */}
              {subtotal > 1000 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                    <Tag className="size-4" />
                    You&apos;re saving ₹{Math.floor(subtotal * 0.1).toLocaleString()} on this order
                  </div>
                </div>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-gray-500">
              <ShoppingBag className="size-16 stroke-[1] text-gray-200" />
              <p className="text-lg font-serif">Your bag is empty.</p>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full bg-[#832729] px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#6a1f22]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group flex gap-4 border-b border-gray-50 pb-6">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#faf9f6]">
                  <Image
                    src={item.imageUrl || "/images/product-placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="pr-4 text-sm font-serif leading-snug text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      disabled={hasPendingMutations || isPending(item.id)}
                      onClick={() => removeCartItem(item.id)}
                      className="mt-0.5 flex-shrink-0 self-start text-gray-400 transition hover:text-[#832729]"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 mb-auto font-serif font-medium text-[#832729]">
                    INR {new Intl.NumberFormat("en-IN").format(item.price)}
                  </div>

                  <div className="mt-3 flex w-max items-center gap-4 border-t border-gray-50 pt-2">
                    <button
                      type="button"
                      disabled={hasPendingMutations || isPending(item.id)}
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-50 text-gray-600 transition hover:bg-gray-100"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
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
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-50 text-gray-600 transition hover:bg-gray-100"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="space-y-4 border-t border-gray-100 bg-[#faf9f6] p-6">
            <div className="flex items-end justify-between">
              <span className="text-right text-sm font-serif text-gray-500">
                Subtotal
              </span>
              <span className="text-2xl leading-none font-serif text-gray-900">
                INR {formattedSubtotal}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Review your bag before checkout. Taxes and shipping are calculated at
              checkout.
            </p>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-[#832729] py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#6a1f22] hover:shadow-lg"
            >
              View Bag
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
