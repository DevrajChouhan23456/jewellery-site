"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Lock,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { ZodError } from "zod";

import { OrderSuccessLottie } from "@/components/lottie/OrderSuccessLottie";
import { GsapStaggerMount } from "@/components/motion/GsapStaggerMount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { Separator } from "@/components/ui/separator";
import { useSiteIdentity } from "@/components/site-identity-provider";
import {
  fetchServerCart,
  mapApiCartToStoreItems,
  removeServerCartItem,
} from "@/lib/cart-client";
import {
  ApiRequestError,
  createCheckoutOrder,
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from "@/lib/checkout-client";
import { openCustomerLogin } from "@/lib/customer-login";
import { mergeCartAfterLogin } from "@/lib/mergeCart";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { hasCustomSiteLogo } from "@/lib/site-identity";
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

const checkoutSteps = [
  {
    title: "Sign in",
    description: "Continue with Google using your saved customer session.",
  },
  {
    title: "Delivery",
    description: "Confirm contact details and shipping address.",
  },
  {
    title: "Pay securely",
    description: "Server-validated Razorpay checkout before confirmation.",
  },
] as const;

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
  const phone =
    (session?.user as { phone?: string | null } | undefined)?.phone ?? "";
  return phone.startsWith("google-") ? "" : phone;
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
  const { siteIdentity } = useSiteIdentity();
  const sessionPhone = getSessionPhone(session);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartItems = useCartStore((state) => state.setItems);
  const [form, setForm] = React.useState(initialForm);
  const [formErrors, setFormErrors] = React.useState<CheckoutFormErrors>({});
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [unavailableProductIds, setUnavailableProductIds] = React.useState<string[]>([]);
  const [completedOrder, setCompletedOrder] = React.useState<{
    orderNumber: string;
    totalAmount: number;
  } | null>(null);
  const [isRefreshingCart, setIsRefreshingCart] = React.useState(false);
  const [isRemovingUnavailableItems, setIsRemovingUnavailableItems] = React.useState(false);
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
          setUnavailableProductIds([]);
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
  const isAuthenticated = status === "authenticated";
  const unavailableSet = React.useMemo(
    () => new Set(unavailableProductIds),
    [unavailableProductIds],
  );
  const unavailableItems = React.useMemo(
    () => items.filter((item) => unavailableSet.has(item.id)),
    [items, unavailableSet],
  );
  const stepStates = React.useMemo(
    () =>
      checkoutSteps.map((step, index) => {
        const isComplete =
          index === 0
            ? isAuthenticated
            : index === 1
              ? isAuthenticated && isFormComplete
              : false;
        const isActive =
          index === 0
            ? !isAuthenticated
            : index === 1
              ? isAuthenticated && !isFormComplete
              : isAuthenticated && isFormComplete;

        return {
          ...step,
          isActive,
          isComplete,
          statusLabel: isComplete ? "Done" : isActive ? "Current" : "Next",
        };
      }),
    [isAuthenticated, isFormComplete],
  );

  const canSubmit =
    mounted &&
    isAuthenticated &&
    items.length > 0 &&
    !isRefreshingCart &&
    !isRemovingUnavailableItems &&
    !isSubmitting &&
    unavailableItems.length === 0 &&
    isFormComplete;
  const canPromptSignIn =
    mounted &&
    status !== "loading" &&
    status !== "authenticated" &&
    items.length > 0 &&
    !isRefreshingCart;
  const isPrimaryActionDisabled =
    isAuthenticated ? !canSubmit : !canPromptSignIn;

  const updateForm = (key: keyof CheckoutFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setCheckoutError(null);
    setUnavailableProductIds([]);
  };

  const handleSignIn = () => {
    setCheckoutError(null);
    setUnavailableProductIds([]);
    openCustomerLogin();
    toast("Continue with Google to reach payment.");
  };

  const handleReviewBag = () => {
    router.push("/cart");
  };

  const handleRemoveUnavailableItems = async () => {
    if (unavailableProductIds.length === 0 || isRemovingUnavailableItems) {
      return;
    }

    setIsRemovingUnavailableItems(true);

    try {
      await Promise.allSettled(
        unavailableProductIds.map((productId) => removeServerCartItem(productId)),
      );

      const refreshedCart = await fetchServerCart();
      setCartItems(mapApiCartToStoreItems(refreshedCart));
      setUnavailableProductIds([]);
      setCheckoutError(
        "Unavailable items were removed from your bag. Review the updated bag and continue when you're ready.",
      );
      toast.success("Unavailable items removed from your bag.");
      router.push("/cart");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not update your bag right now. Please review it manually.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setIsRemovingUnavailableItems(false);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (status !== "authenticated") {
      setCheckoutError(
        "Continue with Google from the header first so we can validate and secure your order before payment.",
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
    setUnavailableProductIds([]);

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
      if (
        error instanceof ApiRequestError &&
        error.code === "CHECKOUT_ITEMS_UNAVAILABLE"
      ) {
        setUnavailableProductIds(error.unavailableProductIds ?? []);
      }

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
      <main className="bg-[linear-gradient(180deg,#fffdf9_0%,#f7f2ea_44%,#f4f8fb_100%)] py-10 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
        <div className="luxury-shell max-w-3xl">
          <div className="rounded-[2rem] border border-[#ecdcc6] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <GsapStaggerMount className="contents">
            <div className="mb-2">
              <OrderSuccessLottie maxWidthClassName="max-w-[200px]" />
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-[#7a1f24]">
              Payment Confirmed
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Your order is placed
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Order <span className="font-semibold">{completedOrder.orderNumber}</span>
              {" "}from {siteIdentity.siteName}
              {" "}for{" "}
              <span className="font-semibold">
                {formatINR(completedOrder.totalAmount)}
              </span>{" "}
              has been confirmed.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-[#7a1f24] px-6 text-white hover:bg-[#64181d]">
                <Link href={`/track/${encodeURIComponent(completedOrder.orderNumber)}`}>
                  Track order
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">Continue shopping</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cart">View bag</Link>
              </Button>
            </div>
            </GsapStaggerMount>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#f7f2ea_44%,#f4f8fb_100%)] py-8 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-5rem] size-[26rem] rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute right-[-8%] top-[6rem] size-[22rem] rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="luxury-shell relative z-10 space-y-6">
        <BlurFade inView delay={0.04}>
          <MagicCard
            className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.4)]"
            gradientFrom="#d6a75c"
            gradientTo="#7dd3fc"
            gradientColor="rgba(214,167,92,0.12)"
            gradientOpacity={0.28}
          >
            <section className="relative overflow-hidden rounded-[inherit] px-6 py-7 sm:px-8 sm:py-8">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(214,167,92,0.24),transparent_58%)]" />
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

              <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900">
                      Secure Checkout
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs font-medium text-stone-600">
                      <ShieldCheck className="size-4 text-emerald-600" />
                      Server-validated order totals
                    </span>
                  </div>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                    Complete your order with a calmer, cleaner finish.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                    {siteIdentity.siteName} keeps address details, cart totals, and
                    payment confirmation aligned so checkout feels premium without
                    losing trust or clarity.
                  </p>
                </div>

                <div className="space-y-3">
                  {stepStates.map((step, index) => (
                    <div
                      key={step.title}
                      className={cn(
                        "relative flex gap-4 rounded-[1.6rem] border px-4 py-4 transition-colors",
                        step.isComplete
                          ? "border-emerald-200 bg-emerald-50/90"
                          : step.isActive
                            ? "border-[#d7b07e] bg-[#fff6eb]"
                            : "border-stone-200/80 bg-white/80",
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                            step.isComplete
                              ? "bg-emerald-600 text-white"
                              : step.isActive
                                ? "bg-[#7a1f24] text-white"
                                : "bg-stone-100 text-stone-600",
                          )}
                        >
                          {step.isComplete ? (
                            <Check className="size-4" />
                          ) : (
                            <span>{`0${index + 1}`}</span>
                          )}
                        </div>
                        {index < stepStates.length - 1 ? (
                          <div
                            className={cn(
                              "mt-2 h-10 w-px",
                              step.isComplete ? "bg-emerald-300" : "bg-stone-200",
                            )}
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-base font-semibold text-stone-950">
                            {step.title}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                              step.isComplete
                                ? "bg-white text-emerald-700"
                                : step.isActive
                                  ? "bg-white text-[#7a1f24]"
                                  : "bg-stone-100 text-stone-500",
                            )}
                          >
                            {step.statusLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-stone-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </MagicCard>
        </BlurFade>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <BlurFade inView delay={0.08}>
          <form
            id="checkout-form"
            onSubmit={onSubmit}
            className="space-y-5 rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur sm:p-6 dark:border-white/10 dark:bg-white/5"
          >
            {status !== "authenticated" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Continue with Google to keep going. Your bag stays saved
                    locally until you complete payment.
                  </p>
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    className="rounded-full bg-[#7a1f24] px-5 text-white hover:bg-[#64181d]"
                  >
                    Continue with Google
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
              <div
                className={cn(
                  "rounded-[1.6rem] border px-4 py-4",
                  unavailableItems.length > 0
                    ? "border-amber-200 bg-amber-50/90 text-amber-950"
                    : "border-rose-200 bg-rose-50 text-rose-700",
                )}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        unavailableItems.length > 0
                          ? "bg-white text-amber-700"
                          : "bg-white text-rose-600",
                      )}
                    >
                      {unavailableItems.length > 0 ? (
                        <ShoppingBag className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {unavailableItems.length > 0
                          ? "A few bag items need review"
                          : "Checkout needs attention"}
                      </p>
                      <p className="text-sm leading-6">{checkoutError}</p>
                    </div>
                  </div>

                  {unavailableItems.length > 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-white/80 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                        Unavailable Right Now
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {unavailableItems.map((item) => (
                          <span
                            key={item.id}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {unavailableItems.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleRemoveUnavailableItems}
                        disabled={isRemovingUnavailableItems}
                        className="rounded-full bg-[#7a1f24] px-5 text-white hover:bg-[#64181d] disabled:opacity-60"
                      >
                        {isRemovingUnavailableItems ? (
                          "Removing Items..."
                        ) : (
                          <>
                            Remove Unavailable Items
                            <RefreshCcw className="ml-2 size-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReviewBag}
                        className="rounded-full border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
                      >
                        Review Bag
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <section className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/75 p-4">
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

            <section className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/75 p-4">
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

            <section className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-stone-50/75 p-4">
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
                    <div className="text-xs font-semibold">Style-Checked Finish</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Quality reviewed
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
          </BlurFade>

          <BlurFade inView delay={0.12}>
          <aside className="space-y-4">
            <div className="sticky top-24 rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(135deg,#fffdf9_0%,#f7f2ea_60%,#edf7fb_100%)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-sm">
                    {hasCustomSiteLogo(siteIdentity) ? (
                      <div className="relative h-8 w-14 overflow-hidden">
                        <Image
                          src={siteIdentity.logoUrl}
                          alt={siteIdentity.siteName}
                          fill
                          sizes="56px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <span className="font-serif text-sm font-semibold tracking-[0.24em] text-[#832729]">
                        {siteIdentity.shortName}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-950">
                      {siteIdentity.siteName}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                      {siteIdentity.tagline}
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {itemCount} item{itemCount === 1 ? "" : "s"} in your bag
              </p>

              {unavailableItems.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {unavailableItems.length} item
                  {unavailableItems.length === 1 ? "" : "s"} need review before
                  payment can continue.
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Your bag is aligned with the current checkout total.
                </div>
              )}

              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#e2d1ba] p-4 text-sm text-slate-600 dark:border-white/20 dark:text-slate-300">
                    No products found. Add products from the shop first.
                  </div>
                ) : (
                  items.map((item) => (
                    <article
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-2.5 transition-colors dark:border-white/10",
                        unavailableSet.has(item.id)
                          ? "border-amber-200 bg-amber-50/80"
                          : "border-[#f0e5d7]",
                      )}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          {unavailableSet.has(item.id) ? (
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                              Needs Review
                            </span>
                          ) : null}
                        </div>
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
                      ? "Continue with Google"
                      : isRemovingUnavailableItems
                        ? "Updating Bag..."
                        : unavailableItems.length > 0
                          ? "Review Bag Items"
                          : isRefreshingCart
                            ? "Refreshing Bag..."
                            : "Pay Securely"}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Truck className="size-4" />
                Free insured shipping across India
              </div>

              <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
                <Link href="/cart">Back to cart</Link>
              </Button>
            </div>
          </aside>
          </BlurFade>
        </div>
      </div>
    </main>
  );
}
