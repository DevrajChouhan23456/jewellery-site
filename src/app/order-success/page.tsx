"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { CheckCircle, Package, Truck, Shield, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const amount = searchParams.get("amount");

  React.useEffect(() => {
    if (!orderId) {
      router.replace("/");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  const orderAmount = amount ? parseInt(amount) : 0;

  return (
    <main className="bg-luxury-ivory min-h-screen py-12 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell max-w-2xl">
        <div className="rounded-[2rem] border border-[#ecdcc6] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
            <CheckCircle className="size-10 text-emerald-600" />
          </div>

          {/* Success Message */}
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">
            Order Confirmed!
          </h1>
          <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          {/* Order Details */}
          <div className="mb-8 rounded-xl border border-[#f0e5d7] bg-[#faf9f6] p-6 dark:border-white/10 dark:bg-neutral-900/50">
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span className="font-mono text-lg font-semibold">{orderId}</span>
              </div>
              {orderAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold text-[#7a1f24]">
                    {formatINR(orderAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Steps */}
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    We're preparing your jewellery with care
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                  <Truck className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Quality Check & Shipping</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Your order will be shipped within 2-3 business days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                  <Shield className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Insured Delivery</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Track your package with real-time updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Trust Badges */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-[#e6d3bf] bg-white p-4 dark:border-white/10 dark:bg-neutral-900/50">
              <Shield className="size-6 text-[#7a1f24]" />
              <span className="text-xs font-medium text-center">
                100% Secure Payment
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-[#e6d3bf] bg-white p-4 dark:border-white/10 dark:bg-neutral-900/50">
              <CheckCircle className="size-6 text-[#7a1f24]" />
              <span className="text-xs font-medium text-center">
                Certified Jewellery
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-[#e6d3bf] bg-white p-4 dark:border-white/10 dark:bg-neutral-900/50">
              <Truck className="size-6 text-[#7a1f24]" />
              <span className="text-xs font-medium text-center">
                Insured Shipping
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full bg-[#7a1f24] px-8 text-white hover:bg-[#64181d]">
              <Link href="/">
                Continue Shopping
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/account/orders">
                View Order Details
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            A confirmation email has been sent to your registered email address.
            For any queries, please contact our customer support.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <React.Suspense fallback={
      <main className="bg-luxury-ivory min-h-screen py-12 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
        <div className="luxury-shell max-w-2xl">
          <div className="rounded-[2rem] border border-[#ecdcc6] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
              <CheckCircle className="size-10 text-emerald-600" />
            </div>
            <p className="text-lg">Loading order confirmation...</p>
          </div>
        </div>
      </main>
    }>
      <OrderSuccessContent />
    </React.Suspense>
  );
}