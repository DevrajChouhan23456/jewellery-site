"use client";

import type { CheckoutInput } from "@/lib/validations/checkout";

type ApiErrorPayload = {
  error?: string;
};

export type CheckoutOrderResponse = {
  order: {
    currency: string;
    id: string;
    itemCount: number;
    orderNumber: string;
    paymentStatus: string;
    status: string;
    subtotalAmount: number;
    totalAmount: number;
  };
};

export type RazorpayOrderResponse = {
  amount: number;
  currency: string;
  key: string;
  orderId: string;
  razorpayOrderId: string;
};

export type RazorpayVerificationPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type RazorpayCheckoutSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutInstance = {
  open: () => void;
};

type RazorpayCheckoutOptions = {
  amount: number;
  currency: string;
  description: string;
  handler: (response: RazorpayCheckoutSuccess) => void;
  key: string;
  modal?: {
    ondismiss?: () => void;
  };
  name: string;
  order_id: string;
  prefill?: {
    contact?: string;
    email?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

async function readResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | T
    | null;

  if (!response.ok) {
    throw new Error(
      (payload as ApiErrorPayload | null)?.error ||
        "Something went wrong. Please try again.",
    );
  }

  return payload as T;
}

export async function createCheckoutOrder(body: CheckoutInput) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readResponse<CheckoutOrderResponse>(response);
}

export async function createRazorpayOrder(orderId: string) {
  const response = await fetch("/api/payment/razorpay/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  return readResponse<RazorpayOrderResponse>(response);
}

export async function verifyRazorpayPayment(
  body: RazorpayVerificationPayload,
) {
  const response = await fetch("/api/payment/razorpay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readResponse<{ message: string; orderId: string }>(response);
}

export async function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.Razorpay) {
    return true;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load the Razorpay checkout script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load the Razorpay checkout script."));
    document.body.appendChild(script);
  });

  return typeof window.Razorpay === "function";
}

export async function openRazorpayCheckout(
  payment: RazorpayOrderResponse,
  prefill: {
    contact?: string;
    email?: string;
    name?: string;
  },
) {
  const loaded = await loadRazorpayCheckoutScript();

  if (!loaded || !window.Razorpay) {
    throw new Error("Payment gateway failed to load. Please try again.");
  }

  const RazorpayCheckout = window.Razorpay;

  return new Promise<RazorpayCheckoutSuccess>((resolve, reject) => {
    const checkout = new RazorpayCheckout({
      amount: payment.amount,
      currency: payment.currency,
      description: "Secure payment for your jewellery order",
      handler: resolve,
      key: payment.key,
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
      name: "Tanishq",
      order_id: payment.razorpayOrderId,
      prefill,
      theme: {
        color: "#7a1f24",
      },
    });

    checkout.open();
  });
}
