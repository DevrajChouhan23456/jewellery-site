"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { ZodError } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fetchServerCart, mapApiCartToStoreItems } from "@/lib/cart-client";
import {
  createCheckoutOrder,
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from "@/lib/checkout-client";
import { openCustomerLogin } from "@/lib/customer-login";
import { mergeCartAfterLogin } from "@/lib/mergeCart";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/features/checkout/validation";

type CheckoutFormState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  email: string;
  fullName: string;
  phone: string;
  postalCode: string;
  state: string;
};

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormState, string>>;

const initialForm: CheckoutFormState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  email: "",
  fullName: "",
  phone: "",
  postalCode: "",
  state: "",
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function fieldClassName(error?: string) {
  return cn("h-11 rounded-xl", error ? "border-rose-300 focus-visible:ring-rose-200" : "");
}

function getSessionPhone(
  session: ReturnType<typeof useSession>["data"],
) {
  return (session?.user as { phone?: string | null } | undefined)?.phone ?? "";
}

function toCheckoutPayload(form: CheckoutFormState): CheckoutInput {
  return {
    billingAddress: {
      city: form.city,
      country: "India",
      email: form.email,
      fullName: form.fullName,
      line1: form.addressLine1,
      ...(form.addressLine2.trim()
        ? { line2: form.addressLine2.trim() }
        : {}),
      phone: form.phone,
      postalCode: form.postalCode,
      state: form.state,
    },
    shippingAddress: {
      city: form.city,
      country: "India",
      email: form.email,
      fullName: form.fullName,
      line1: form.addressLine1,
      ...(form.addressLine2.trim()
        ? { line2: form.addressLine2.trim() }
        : {}),
      phone: form.phone,
      postalCode: form.postalCode,
      state: form.state,
    },
  };
}

function mapValidationErrors(error: ZodError<CheckoutInput>): CheckoutFormErrors {
  const nextErrors: CheckoutFormErrors = {};

  for (const issue of error.issues) {
    if (issue.path[0] !== "shippingAddress") {
      continue;
    }

    const field = issue.path[1];

    if (typeof field !== "string" || nextErrors[field as keyof CheckoutFormState]) {
      continue;
    }

    switch (field) {
      case "fullName":
      case "email":
      case "phone":
      case "city":
      case "state":
      case "postalCode":
        nextErrors[field] = issue.message;
        break;
      case "line1":
        nextErrors.addressLine1 = issue.message;
        break;
      case "line2":
        nextErrors.addressLine2 = issue.message;
        break;
      default:
        break;
    }
  }

  return nextErrors;
}

function CartPageSkeleton() {
  return (
    <main className="bg-luxury-ivory py-8 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell">
        <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
          <div className="space-y-5 rounded-[1.75rem] border border-[#ecdcc6] bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5">
            <div className="h-28 animate-pulse rounded-2xl bg-[#f7f1ea]" />
            <div className="h-40 animate-pulse rounded-2xl bg-[#f3ede4]" />
            <div className="h-40 animate-pulse rounded-2xl bg-[#f3ede4]" />
          </div>
          <div className="h-80 animate-pulse rounded-[1.75rem] bg-[#f7f1ea]" />
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionPhone = getSessionPhone(session);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartItems = useCartStore((state) => state.setItems);
  const [form, setForm] = React.useState(initialForm);
  const [formErrors, setFormErrors] = React.useState<CheckoutFormErrors>({});
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<{
    orderNumber: string;
    totalAmount: number;
  } | null>(null);
  const [isRefreshingCart, setIsRefreshingCart] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  React.useEffect(() => {
    setForm((current) => ({
      ...current,
      email: current.email || session?.user?.email || "",
      fullName: current.fullName || session?.user?.name || "",
      phone: current.phone || sessionPhone,
    }));
  }, [session?.user?.email, session?.user?.name, sessionPhone]);

  React.useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;
    setIsRefreshingCart(true);

    void (async () => {
      try {
        await mergeCartAfterLogin();
        const cart = await fetchServerCart();

        if (!cancelled) {
          setCartItems(mapApiCartToStoreItems(cart));
        }
      } catch (error) {
        if (!cancelled) {
          setCheckoutError(
            error instanceof Error
              ? error.message
              : "We could not refresh your bag. Please go back to your cart and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsRefreshingCart(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setCartItems, status]);

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  const itemCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const payload = React.useMemo(() => toCheckoutPayload(form), [form]);
  const isFormComplete = React.useMemo(
    () => checkoutSchema.safeParse(payload).success,
    [payload],
  );

  const canSubmit =
    mounted &&
    status === "authenticated" &&
    items.length > 0 &&
    !isRefreshingCart &&
    !isSubmitting &&
    isFormComplete;
  const canPromptSignIn =
    mounted &&
    status !== "loading" &&
    status !== "authenticated" &&
    items.length > 0 &&
    !isRefreshingCart;
  const isPrimaryActionDisabled =
    status === "authenticated" ? !canSubmit : !canPromptSignIn;

  const updateForm = (key: keyof CheckoutFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setCheckoutError(null);
  };

  const handleSignIn = () => {
    setCheckoutError(null);
    openCustomerLogin();
    toast("Sign in to continue to payment.");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (status !== "authenticated") {
      setCheckoutError(
        "Sign in from the header first so we can validate and secure your order before payment.",
      );
      return;
    }

    if (isRefreshingCart) {
      setCheckoutError("We are still syncing your bag. Please wait a moment.");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("Your bag is empty.");
      return;
    }

    const parsed = checkoutSchema.safeParse(payload);

    if (!parsed.success) {
      setFormErrors(mapValidationErrors(parsed.error));
      setCheckoutError("Please correct the highlighted details before continuing.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);
    setFormErrors({});

    try {
      const checkoutResponse = await createCheckoutOrder(parsed.data);
      const payment = await createRazorpayOrder(checkoutResponse.order.id);
      const razorpayResult = await openRazorpayCheckout(payment, {
        contact: form.phone,
        email: form.email,
        name: form.fullName,
      });

      await verifyRazorpayPayment({
        orderId: checkoutResponse.order.id,
        razorpayOrderId: razorpayResult.razorpay_order_id,
        razorpayPaymentId: razorpayResult.razorpay_payment_id,
        razorpaySignature: razorpayResult.razorpay_signature,
      });

      setCompletedOrder({
        orderNumber: checkoutResponse.order.orderNumber,
        totalAmount: checkoutResponse.order.totalAmount,
      });
      clearCart();
      toast.success("Payment successful.");

      // Redirect to success page
      router.push(`/order-success?order=${checkoutResponse.order.orderNumber}&amount=${checkoutResponse.order.totalAmount}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not complete checkout right now.";

      setCheckoutError(message);

      if (message === "Payment was cancelled.") {
        toast("Payment cancelled.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return <CartPageSkeleton />;
  }

  if (completedOrder) {
    return (
      <main className="bg-luxury-ivory py-10 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
        <div className="luxury-shell max-w-3xl">
          <div className="rounded-[2rem] border border-[#ecdcc6] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-8" />
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-[#7a1f24]">
              Payment Confirmed
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Your order is placed
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Order <span className="font-semibold">{completedOrder.orderNumber}</span>
              {" "}for{" "}
              <span className="font-semibold">
                {formatINR(completedOrder.totalAmount)}
              </span>{" "}
              has been confirmed.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-[#7a1f24] px-6 text-white hover:bg-[#64181d]">
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cart">View Bag</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-luxury-ivory py-8 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#7a1f24]">Secure Checkout</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Complete Your Order
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <ShieldCheck className="size-4 text-emerald-600" />
            Server-validated order totals
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
          <form
            id="checkout-form"
            onSubmit={onSubmit}
            className="space-y-5 rounded-[1.75rem] border border-[#ecdcc6] bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5"
          >
            {status !== "authenticated" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Sign in to continue. Your bag stays saved locally until you
                    complete payment.
                  </p>
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    className="rounded-full bg-[#7a1f24] px-5 text-white hover:bg-[#64181d]"
                  >
                    Sign in to Continue
                  </Button>
                </div>
              </div>
            ) : null}

            {isRefreshingCart ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Refreshing your bag before payment.
              </div>
            ) : null}

            {checkoutError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {checkoutError}
              </div>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-[#7a1f24]" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Input
                    placeholder="Full name"
                    className={fieldClassName(formErrors.fullName)}
                    value={form.fullName}
                    onChange={(event) => updateForm("fullName", event.target.value)}
                    aria-invalid={Boolean(formErrors.fullName)}
                  />
                  {formErrors.fullName ? (
                    <p className="text-xs text-rose-600">{formErrors.fullName}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Input
                    type="email"
                    placeholder="Email address"
                    className={fieldClassName(formErrors.email)}
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    aria-invalid={Boolean(formErrors.email)}
                  />
                  {formErrors.email ? (
                    <p className="text-xs text-rose-600">{formErrors.email}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    placeholder="Phone number"
                    className={fieldClassName(formErrors.phone)}
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                    aria-invalid={Boolean(formErrors.phone)}
                  />
                  {formErrors.phone ? (
                    <p className="text-xs text-rose-600">{formErrors.phone}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-[#7a1f24]" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    placeholder="Address line 1"
                    className={fieldClassName(formErrors.addressLine1)}
                    value={form.addressLine1}
                    onChange={(event) =>
                      updateForm("addressLine1", event.target.value)
                    }
                    aria-invalid={Boolean(formErrors.addressLine1)}
                  />
                  {formErrors.addressLine1 ? (
                    <p className="text-xs text-rose-600">
                      {formErrors.addressLine1}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    placeholder="Address line 2 (optional)"
                    className={fieldClassName(formErrors.addressLine2)}
                    value={form.addressLine2}
                    onChange={(event) =>
                      updateForm("addressLine2", event.target.value)
                    }
                    aria-invalid={Boolean(formErrors.addressLine2)}
                  />
                  {formErrors.addressLine2 ? (
                    <p className="text-xs text-rose-600">
                      {formErrors.addressLine2}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Input
                    placeholder="City"
                    className={fieldClassName(formErrors.city)}
                    value={form.city}
                    onChange={(event) => updateForm("city", event.target.value)}
                    aria-invalid={Boolean(formErrors.city)}
                  />
                  {formErrors.city ? (
                    <p className="text-xs text-rose-600">{formErrors.city}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Input
                    placeholder="State"
                    className={fieldClassName(formErrors.state)}
                    value={form.state}
                    onChange={(event) => updateForm("state", event.target.value)}
                    aria-invalid={Boolean(formErrors.state)}
                  />
                  {formErrors.state ? (
                    <p className="text-xs text-rose-600">{formErrors.state}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    placeholder="PIN code"
                    className={fieldClassName(formErrors.postalCode)}
                    value={form.postalCode}
                    onChange={(event) =>
                      updateForm("postalCode", event.target.value)
                    }
                    aria-invalid={Boolean(formErrors.postalCode)}
                  />
                  {formErrors.postalCode ? (
                    <p className="text-xs text-rose-600">
                      {formErrors.postalCode}
                    </p>
                  ) : null}
                </div>
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
                  <p className="text-sm font-medium">Razorpay Checkout</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Secure
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Your payable amount is recalculated on the server before payment
                  begins.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-[#e6d3bf] bg-white p-3 dark:border-white/10 dark:bg-neutral-900/50">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">100% Secure Payment</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      SSL encrypted
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#e6d3bf] bg-white p-3 dark:border-white/10 dark:bg-neutral-900/50">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    <BadgeCheck className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Certified Jewellery</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      BIS Hallmarked
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#e6d3bf] bg-white p-3 dark:border-white/10 dark:bg-neutral-900/50">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Insured Shipping</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Full coverage
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 size-4 text-[#7a1f24]" />
                <p>
                  We validate your bag, prices, and payment signature on the backend
                  before confirming your order.
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
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatINR(item.price * item.quantity)}
                      </p>
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
                type={status === "authenticated" ? "submit" : "button"}
                form={status === "authenticated" ? "checkout-form" : undefined}
                onClick={
                  status === "authenticated" ? undefined : handleSignIn
                }
                disabled={isPrimaryActionDisabled}
                className="mt-5 h-12 w-full rounded-full bg-[#7a1f24] text-base text-white hover:bg-[#64181d] disabled:opacity-60"
              >
                {isSubmitting
                  ? "Processing Payment..."
                  : status === "loading"
                    ? "Checking Session..."
                    : status !== "authenticated"
                      ? "Sign in to Continue"
                      : isRefreshingCart
                        ? "Refreshing Bag..."
                        : "Pay Securely"}
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
