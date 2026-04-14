"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

const FREE_SHIPPING_THRESHOLD = 5000;

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
  const { status } = useSession();
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
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const highQuantityItems = items.some((item) => item.quantity >= 5);

  const onApplyCoupon = (event: React.FormEvent) => {
    event.preventDefault();
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
    <main className="bg-[linear-gradient(180deg,#fffdf9_0%,#f7f2ea_42%,#f5f8fb_100%)] pb-24 pt-6 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f6efe7_58%,#edf8fb_100%)] p-6 shadow-[0_24px_60px_-44px_rgba(28,25,23,0.42)]">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7a1f24]">
                    <ShieldCheck className="size-4" />
                    Bag Review
                  </div>
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#241617] sm:text-4xl">
                    Your bag is almost ready for checkout.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d4a45] sm:text-base">
                    Review your pieces, adjust quantity, and move to secure payment
                    when everything feels right.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Items
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {itemCount}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Total pieces in your bag
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Subtotal
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {formatINR(subtotal)}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Taxes and shipping calculated later
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Checkout
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {status === "authenticated" ? "Ready" : "Sign In"}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Google sign-in unlocks payment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {syncError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {syncError}
              </div>
            ) : null}

            {status !== "authenticated" && items.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Your bag is saved on this device. Continue to checkout and sign in
                with Google there before payment.
              </div>
            ) : null}

            {items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Truck className="size-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-emerald-800">
                        {freeShippingRemaining === 0
                          ? "Free shipping unlocked"
                          : "Free shipping progress"}
                      </div>
                      <div className="text-xs text-emerald-700">
                        {freeShippingRemaining === 0
                          ? "Your order already qualifies for insured shipping."
                          : `${formatINR(freeShippingRemaining)} more to unlock free shipping.`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-emerald-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e6d3bf] bg-white p-4 shadow-sm dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#f6ede3] text-[#7a1f24]">
                      <Lock className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Secure checkout
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        Bag totals stay validated before payment.
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    highQuantityItems
                      ? "border-amber-200 bg-amber-50"
                      : "border-sky-200 bg-sky-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full",
                        highQuantityItems
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700",
                      )}
                    >
                      {highQuantityItems ? (
                        <Bell className="size-5" />
                      ) : (
                        <Tag className="size-5" />
                      )}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-semibold",
                          highQuantityItems ? "text-amber-900" : "text-sky-900",
                        )}
                      >
                        {highQuantityItems ? "Large quantity check" : "Quick checkout flow"}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          highQuantityItems ? "text-amber-700" : "text-sky-700",
                        )}
                      >
                        {highQuantityItems
                          ? "A few line items have higher quantities. Review them before payment."
                          : "Sign in, confirm delivery, and pay in one clean flow."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {items.length === 0 ? (
              <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
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
                      className="relative overflow-hidden rounded-[2rem] border border-[#eadccf] bg-white shadow-[0_18px_44px_-36px_rgba(28,25,23,0.45)] dark:border-white/10 dark:bg-white/5"
                    >
                      <button
                        type="button"
                        aria-label="Remove item"
                        disabled={itemIsPending}
                        className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-black/10 bg-white/85 text-slate-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-neutral-950/60 dark:text-slate-200"
                        onClick={() => removeCartItem(item.id)}
                      >
                        <X className="size-4" />
                      </button>

                      <div className="grid gap-5 p-4 sm:grid-cols-[160px_1fr] sm:p-5">
                        <div className="relative overflow-hidden rounded-[1.5rem] border border-black/5 bg-linear-to-br from-amber-50 to-white dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950">
                          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a1f24] shadow-sm">
                            Ready
                          </div>
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={320}
                              height={260}
                              className="h-[140px] w-full object-contain p-6 sm:h-[160px]"
                            />
                          ) : (
                            <div className="grid h-[140px] place-items-center sm:h-[160px]">
                              <CirclePlus className="size-10 text-[#c6a16e]" />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col gap-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Bag Item
                              </p>
                              <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                                {item.name}
                              </h2>
                              {(item.meta?.size || item.meta?.weight) ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                                  {item.meta?.size ? (
                                    <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-white/10">
                                      Size {item.meta.size}
                                    </span>
                                  ) : null}
                                  {item.meta?.weight ? (
                                    <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-white/10">
                                      Weight {item.meta.weight}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                Unit Price
                              </p>
                              <p className="mt-1 text-xl font-semibold text-[#7a1f24]">
                                {formatINR(item.price)}
                              </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:items-end">
                              <div className="flex items-center gap-3">
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
                                    <Minus className="size-4" />
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
                                    <Plus className="size-4" />
                                  </Button>
                                </div>

                                <div className="rounded-2xl border border-[#eadfce] bg-[#fffbf6] px-4 py-3 text-right dark:border-white/10 dark:bg-white/5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    Line Total
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">
                                    {formatINR(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-300">
                                {itemIsPending
                                  ? "Updating your bag..."
                                  : "Protected quantity sync keeps your bag current."}
                              </p>
                            </div>
                          </div>
                        </div>
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
                    <div className="text-sm font-semibold">Easy &amp; Secure Payments</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Protected through a verified checkout flow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_48px_-38px_rgba(28,25,23,0.45)] dark:border-white/10 dark:bg-white/5">
                <div className="rounded-[1.5rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdf9_0%,#f7f2ea_60%,#eef8fb_100%)] p-4">
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    Order Summary
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-black/10 bg-slate-50 px-3 py-3 text-left text-sm font-medium dark:border-white/10 dark:bg-neutral-950/40"
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
                        onChange={(event) => setCoupon(event.target.value)}
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

                {items.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-[#f0e5d7] p-3 dark:border-white/10"
                      >
                        <div className="overflow-hidden rounded-lg bg-[#f7f0e7] dark:bg-neutral-900">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={56}
                              height={56}
                              className="size-14 object-cover"
                            />
                          ) : (
                            <div className="grid size-14 place-items-center text-xs text-slate-500">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-300">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    {items.length > 3 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        +{items.length - 3} more item{items.length - 3 === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
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

                <Button
                  type="button"
                  onClick={onCheckout}
                  disabled={items.length === 0 || hasPendingMutations || status === "loading"}
                  className="mt-5 h-12 w-full rounded-full bg-[#7a1f24] text-base text-white shadow-sm hover:bg-[#6a1a1f] disabled:opacity-50"
                >
                  {hasPendingMutations
                    ? "Updating Bag..."
                    : status === "loading"
                      ? "Checking Session..."
                      : "Continue to Checkout"}
                </Button>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="size-4" />
                  Server-validated totals before payment
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
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {freeShippingRemaining === 0
                ? "Free shipping unlocked for this bag."
                : `${formatINR(freeShippingRemaining)} away from free shipping.`}
            </div>
          </div>
          <Button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || hasPendingMutations || status === "loading"}
            className="h-12 w-[240px] rounded-full bg-[#7a1f24] text-base text-white shadow-sm hover:bg-[#6a1a1f] disabled:opacity-50 sm:w-[360px]"
          >
            {hasPendingMutations
              ? "Updating Bag..."
              : status === "loading"
                ? "Checking Session..."
                : "Continue to Checkout"}
          </Button>
        </div>
      </div>
    </main>
  );
}
