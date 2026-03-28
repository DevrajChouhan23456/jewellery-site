"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  ChevronDown,
  CirclePlus,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  Truck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import { useCartMutations } from "@/lib/use-cart-mutations";
import { cn } from "@/lib/utils";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CartPageSkeleton() {
  return (
    <main className="bg-white pb-24 pt-6 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-[#f7f1ea]" />
            <div className="h-48 animate-pulse rounded-2xl bg-[#f3ede4]" />
            <div className="h-48 animate-pulse rounded-2xl bg-[#f3ede4]" />
          </section>
          <aside className="h-72 animate-pulse rounded-2xl bg-[#f7f1ea]" />
        </div>
      </div>
    </main>
  );
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const [coupon, setCoupon] = React.useState("");
  const [couponOpen, setCouponOpen] = React.useState(false);
  const {
    hasPendingMutations,
    isPending,
    removeCartItem,
    syncError,
    updateCartItemQuantity,
  } = useCartMutations();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const itemCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const productDiscount = 0;
  const deliveryCharge = 0;
  const total = Math.max(0, subtotal - productDiscount + deliveryCharge);
  const youSave = productDiscount;

  const onApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Promo codes are not wired yet.");
  };

  const onCheckout = () => {
    if (items.length === 0 || hasPendingMutations) {
      return;
    }

    router.push("/checkout");
  };

  if (!mounted) {
    return <CartPageSkeleton />;
  }

  return (
    <main className="bg-white pb-24 pt-6 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#d8b48a] bg-[#fff8f1] p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full border border-[#e6d3bf] bg-white">
                    <Bell className="size-5 text-[#8b2b2f]" />
                  </div>
                  <p className="text-balance text-base font-medium text-[#2b1b1d] sm:text-lg">
                    Do not miss out. Get notified when your bag price drops.
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-10 rounded-full bg-[#7a1f24] px-6 text-white hover:bg-[#6a1a1f]"
                  onClick={() => toast("Notifications are not wired yet.")}
                >
                  Notify Me
                </Button>
              </div>
            </div>

            {syncError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {syncError}
              </div>
            ) : null}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                <h1 className="text-xl font-semibold">Your bag is empty</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Add products to your bag to see them here.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/">Continue shopping</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemIsPending = isPending(item.id) || hasPendingMutations;

                  return (
                    <article
                      key={item.id}
                      className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <button
                        type="button"
                        aria-label="Remove item"
                        disabled={itemIsPending}
                        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-black/10 bg-white/70 text-slate-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-neutral-950/50 dark:text-slate-200"
                        onClick={() => removeCartItem(item.id)}
                      >
                        <X className="size-4" />
                      </button>

                      <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr] sm:items-start sm:p-5">
                        <div className="relative overflow-hidden rounded-xl border border-black/5 bg-linear-to-br from-amber-50 to-white dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={280}
                              height={220}
                              className="h-[120px] w-full object-contain p-6 sm:h-[140px]"
                            />
                          ) : (
                            <div className="grid h-[120px] place-items-center sm:h-[140px]">
                              <CirclePlus className="size-10 text-[#c6a16e]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="text-lg font-semibold tracking-tight">
                                {formatINR(item.price)}
                              </div>
                              <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                                {item.name}
                              </div>
                              {(item.meta?.size || item.meta?.weight) ? (
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                                  {item.meta?.size ? (
                                    <span>Size: {item.meta.size}</span>
                                  ) : null}
                                  {item.meta?.size && item.meta?.weight ? (
                                    <span className="px-2">|</span>
                                  ) : null}
                                  {item.meta?.weight ? (
                                    <span>Weight: {item.meta.weight}</span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-3 sm:mt-0 sm:flex-col sm:items-end">
                              <div className="text-xs text-slate-500 dark:text-slate-300">
                                Qty:&nbsp;
                                <span className="font-semibold text-slate-900 dark:text-slate-50">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-1 py-1 shadow-sm dark:border-white/10 dark:bg-neutral-950/40">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="rounded-full"
                                  disabled={itemIsPending}
                                  onClick={() =>
                                    updateCartItemQuantity(item.id, item.quantity - 1)
                                  }
                                  aria-label={
                                    item.quantity === 1
                                      ? "Remove item"
                                      : "Decrease quantity"
                                  }
                                >
                                  <Minus className="size-3.5" />
                                </Button>
                                <div className="min-w-8 text-center text-sm font-medium tabular-nums">
                                  {itemIsPending ? "..." : item.quantity}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="rounded-full"
                                  disabled={itemIsPending || item.quantity >= 99}
                                  onClick={() =>
                                    updateCartItemQuantity(item.id, item.quantity + 1)
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t border-black/5 bg-slate-50 px-4 py-3 text-sm text-[#7a1f24] dark:border-white/10 dark:bg-neutral-950/40">
                        <div className="grid size-8 place-items-center rounded-full bg-white shadow-sm dark:bg-neutral-900">
                          <CirclePlus className="size-4" />
                        </div>
                        <button
                          type="button"
                          className="font-medium hover:underline"
                          onClick={() => toast("Gift messages are not wired yet.")}
                        >
                          Add a Gift Message
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e6a7a8] bg-white p-4 shadow-sm dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-6 text-[#7a1f24]" />
                  <div>
                    <div className="text-sm font-semibold">Purity Guaranteed</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      On every online purchase
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e6a7a8] bg-white p-4 shadow-sm dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 size-6 text-[#7a1f24]" />
                  <div>
                    <div className="text-sm font-semibold">Secure Delivery</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      By our trusted partners
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e6a7a8] bg-white p-4 shadow-sm dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 size-6 text-[#7a1f24]" />
                  <div>
                    <div className="text-sm font-semibold">
                      Easy &amp; Secure Payments
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Backed by the trust of TATA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-slate-50 px-3 py-3 text-left text-sm font-medium dark:border-white/10 dark:bg-neutral-950/40"
                  onClick={() => setCouponOpen((value) => !value)}
                >
                  <span>Apply Coupon code / Promo Code</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      couponOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {couponOpen ? (
                  <form onSubmit={onApplyCoupon} className="mt-3 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter code"
                        className="h-10 pl-9"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-10 rounded-xl"
                    >
                      Apply
                    </Button>
                  </form>
                ) : null}

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-200">
                      Sub Total
                    </span>
                    <span className="font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-200">
                      Product Discount
                    </span>
                    <span className="font-medium">
                      - {formatINR(productDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-200">
                      Delivery Charge
                    </span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      TOTAL (Incl. of all taxes)
                    </span>
                    <span className="text-base font-semibold">
                      {formatINR(total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-200">
                      You Save
                    </span>
                    <span className="font-medium">+ {formatINR(youSave)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Total{" "}
              <span className="text-slate-400 dark:text-slate-500">
                ({itemCount} Item{itemCount === 1 ? "" : "s"})
              </span>
              :{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {formatINR(total)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || hasPendingMutations}
            className="h-12 w-[240px] rounded-full bg-[#7a1f24] text-base text-white shadow-sm hover:bg-[#6a1a1f] disabled:opacity-50 sm:w-[360px]"
          >
            {hasPendingMutations ? "Updating Bag..." : "Proceed to Checkout"}
          </Button>
        </div>
      </div>
    </main>
  );
}
