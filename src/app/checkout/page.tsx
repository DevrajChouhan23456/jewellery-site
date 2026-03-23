"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { BadgeCheck, CreditCard, Lock, MapPin, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
};

const CART_STORAGE_KEY = "cart.items.v1";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("₹", "₹ ");
}

function readCartFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => item as Partial<CartItem>)
      .filter((item) => typeof item.id === "string" && typeof item.name === "string")
      .map((item) => ({
        id: item.id!,
        name: item.name!,
        price: typeof item.price === "number" ? item.price : 0,
        qty: typeof item.qty === "number" ? Math.max(1, item.qty) : 1,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      }));
  } catch {
    return [];
  }
}

export default function CheckoutPage() {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [form, setForm] = React.useState(initialForm);
  const [placing, setPlacing] = React.useState(false);

  React.useEffect(() => {
    setItems(readCartFromStorage());
  }, []);

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const shipping = subtotal > 0 ? 0 : 0;
  const tax = Math.round(subtotal * 0.03);
  const total = subtotal + shipping + tax;

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const updateForm = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setPlacing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Order placed! Payment gateway can be connected next.");
    setPlacing(false);
  };

  const canSubmit =
    form.fullName &&
    form.email &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.state &&
    form.postalCode &&
    items.length > 0;

  return (
    <main className="bg-luxury-ivory py-8 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#7a1f24]">Secure Checkout</p>
            <h1 className="text-3xl font-semibold tracking-tight">Complete Your Order</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <ShieldCheck className="size-4 text-emerald-600" />
            100% Secure Payment
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
          <form
            id="checkout-form"
            onSubmit={placeOrder}
            className="space-y-5 rounded-[1.75rem] border border-[#ecdcc6] bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5"
          >
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-[#7a1f24]" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Full name"
                  className="h-11 rounded-xl"
                  value={form.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="h-11 rounded-xl"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                />
                <Input
                  placeholder="Phone number"
                  className="h-11 rounded-xl sm:col-span-2"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-[#7a1f24]" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Address line 1"
                  className="h-11 rounded-xl sm:col-span-2"
                  value={form.addressLine1}
                  onChange={(e) => updateForm("addressLine1", e.target.value)}
                />
                <Input
                  placeholder="Address line 2 (optional)"
                  className="h-11 rounded-xl sm:col-span-2"
                  value={form.addressLine2}
                  onChange={(e) => updateForm("addressLine2", e.target.value)}
                />
                <Input
                  placeholder="City"
                  className="h-11 rounded-xl"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                />
                <Input
                  placeholder="State"
                  className="h-11 rounded-xl"
                  value={form.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                />
                <Input
                  placeholder="PIN code"
                  className="h-11 rounded-xl sm:col-span-2"
                  value={form.postalCode}
                  onChange={(e) => updateForm("postalCode", e.target.value)}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-[#7a1f24]" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <div className="rounded-2xl border border-[#eadfce] bg-[#fffbf6] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">UPI / Card / Net Banking</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Recommended
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Payment gateway is ready to connect to Razorpay/Stripe.
                </p>
              </div>
            </section>

            <div className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 size-4 text-[#7a1f24]" />
                <p>
                  Your data is encrypted and processed securely. By placing this order, you
                  agree to our terms and return policy.
                </p>
              </div>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="sticky top-24 rounded-[1.75rem] border border-[#ecdcc6] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {itemCount} item{itemCount === 1 ? "" : "s"} in your bag
              </p>

              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#e2d1ba] p-4 text-sm text-slate-600 dark:border-white/20 dark:text-slate-300">
                    No products found. Add products from the shop first.
                  </div>
                ) : (
                  items.map((item) => (
                    <article
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-[#f0e5d7] p-2.5 dark:border-white/10"
                    >
                      <div className="overflow-hidden rounded-lg bg-[#f7f0e7] dark:bg-neutral-900">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={70}
                            height={70}
                            className="size-[70px] object-cover"
                          />
                        ) : (
                          <div className="grid size-[70px] place-items-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          Qty {item.qty}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatINR(item.price * item.qty)}</p>
                    </article>
                  ))
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Shipping</span>
                  <span className="font-medium text-emerald-600">
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Taxes</span>
                  <span className="font-medium">{formatINR(tax)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatINR(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={!canSubmit || placing}
                className="mt-5 h-12 w-full rounded-full bg-[#7a1f24] text-base text-white hover:bg-[#64181d]"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Truck className="size-3.5" />
                Free insured shipping across India
              </div>

              <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
                <Link href="/cart">Back to cart</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
