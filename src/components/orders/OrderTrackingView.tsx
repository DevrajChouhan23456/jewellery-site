"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CircleDot,
  MapPin,
  Package,
  Truck,
  AlertTriangle,
} from "lucide-react";

import type { OrderTrackingPayload } from "@/server/orders/tracking-serializer";
import {
  TRACKING_STEPS,
  getTrackingRank,
  stepVisualState,
} from "@/components/orders/order-tracking-utils";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const stepIcon = [Package, Package, Truck, Truck] as const;

export function OrderTrackingView({
  order,
  lastSyncedAt,
}: {
  order: OrderTrackingPayload;
  lastSyncedAt: Date | null;
}) {
  const rank = getTrackingRank(order.status, order.paymentStatus);
  const cancelled = order.status === "CANCELLED";
  const shipping = order.shippingAddress;

  return (
    <div className="space-y-8">
      {cancelled && (
        <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Order cancelled</p>
            <p className="mt-1 text-sm opacity-90">
              This order is no longer being fulfilled. If you were charged, our
              support team will help with a refund.
            </p>
          </div>
        </div>
      )}

      {order.paymentStatus !== "PAID" && !cancelled && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100">
          <CircleDot className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Payment pending</p>
            <p className="mt-1 text-sm opacity-90">
              We’re waiting for payment confirmation. This page will update
              automatically once payment succeeds.
            </p>
          </div>
        </div>
      )}

      <header className="rounded-2xl border border-[#ecdcc6] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a1f24]">
          Track order
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Order #{order.orderNumber}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <span>Placed {formatTime(order.createdAt)}</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatINR(order.totalAmount)}
          </span>
          {lastSyncedAt && (
            <span className="text-slate-500">
              Updated {formatTime(lastSyncedAt.toISOString())}
            </span>
          )}
        </div>
      </header>

      {!cancelled && (
        <section className="rounded-2xl border border-[#ecdcc6] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Delivery progress
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Status updates when our team moves your order forward—same as food
            apps, but for insured jewellery delivery.
          </p>

          <ol className="relative mt-8 space-y-0">
            {TRACKING_STEPS.map((step, index) => {
              const Icon = stepIcon[index] ?? Package;
              const visual = stepVisualState(index, rank);

              return (
                <li key={step.key} className="relative flex gap-4 pb-10 last:pb-0">
                  {index < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute left-[18px] top-10 bottom-0 w-px ${
                        rank >= 0 && index < rank
                          ? "bg-emerald-500/70"
                          : "bg-slate-200 dark:bg-white/15"
                      }`}
                      aria-hidden
                    />
                  )}

                  <div
                    className={`relative z-1 flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${
                      visual === "done"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : visual === "current"
                          ? "border-[#7a1f24] bg-[#7a1f24]/10 text-[#7a1f24] ring-4 ring-[#7a1f24]/15"
                          : "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/20 dark:bg-white/5"
                    }`}
                  >
                    {visual === "done" ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`font-semibold ${
                        visual === "upcoming"
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-slate-50"
                      }`}
                    >
                      {step.title}
                      {visual === "current" && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-[#7a1f24]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7a1f24]">
                          Now
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {step.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {shipping && typeof shipping.addressLine1 === "string" && (
        <section className="rounded-2xl border border-[#ecdcc6] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <MapPin className="size-5 text-[#7a1f24]" />
            Delivery address
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {shipping.addressLine1 as string}
            <br />
            {[
              shipping.city,
              shipping.state,
              shipping.postalCode ?? shipping.postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
            {shipping.country ? (
              <>
                <br />
                {String(shipping.country)}
              </>
            ) : null}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-[#ecdcc6] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Items
        </h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => {
            const img = item.product.images[0];
            return (
              <li
                key={item.id}
                className="flex gap-4 rounded-xl border border-stone-100 bg-[#faf9f6] p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-800">
                  {img ? (
                    <Image
                      src={img}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-stone-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Qty {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatINR(item.lineTotal)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/account/orders"
          className="inline-flex rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-stone-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
        >
          All orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-[#7a1f24] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#64181d]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
