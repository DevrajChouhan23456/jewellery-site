type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

function getPostHogClient(): PostHogClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  const posthog = (
    window as Window & {
      posthog?: PostHogClient;
    }
  ).posthog;

  if (!posthog || typeof posthog.capture !== "function") {
    return null;
  }

  return posthog;
}

function capturePostHogEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  const posthog = getPostHogClient();

  if (!posthog) {
    return;
  }

  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

export const posthogEvents = {
  trackUserSignup: (userId: string, method: string) => {
    capturePostHogEvent("user_signup", {
      user_id: userId,
      method,
    });
  },
  trackUserLogin: (userId: string, method: string) => {
    capturePostHogEvent("user_login", {
      user_id: userId,
      method,
    });
  },
  trackProductView: (
    productId: string,
    productName: string,
    category?: string,
    price?: number,
  ) => {
    capturePostHogEvent("product_viewed", {
      product_id: productId,
      product_name: productName,
      category,
      price,
    });
  },
  trackAddToCart: (
    productId: string,
    quantity: number,
    productName?: string,
    price?: number,
  ) => {
    capturePostHogEvent("cart_add", {
      product_id: productId,
      product_name: productName,
      quantity,
      price,
    });
  },
  trackRemoveFromCart: (
    productId: string,
    quantity: number,
    productName?: string,
  ) => {
    capturePostHogEvent("cart_remove", {
      product_id: productId,
      product_name: productName,
      quantity,
    });
  },
  trackCartView: (cartId: string, itemCount: number, totalValue: number) => {
    capturePostHogEvent("cart_viewed", {
      cart_id: cartId,
      item_count: itemCount,
      total_value: totalValue,
    });
  },
  trackCheckoutStart: (
    cartId: string,
    itemCount: number,
    totalValue: number,
  ) => {
    capturePostHogEvent("checkout_started", {
      cart_id: cartId,
      item_count: itemCount,
      total_value: totalValue,
    });
  },
  trackPaymentMethodSelected: (method: string, orderId: string) => {
    capturePostHogEvent("payment_method_selected", {
      method,
      order_id: orderId,
    });
  },
  trackPaymentInitiated: (orderId: string, amount: number, method: string) => {
    capturePostHogEvent("payment_initiated", {
      order_id: orderId,
      amount,
      method,
    });
  },
  trackPaymentSuccess: (orderId: string, amount: number, method: string) => {
    capturePostHogEvent("payment_success", {
      order_id: orderId,
      amount,
      method,
    });
  },
  trackPaymentFailed: (
    orderId: string,
    amount: number,
    method: string,
    error?: string,
  ) => {
    capturePostHogEvent("payment_failed", {
      order_id: orderId,
      amount,
      method,
      error,
    });
  },
  trackCheckout: (
    orderId: string,
    totalAmount: number,
    itemCount?: number,
    paymentMethod?: string,
  ) => {
    capturePostHogEvent("checkout_complete", {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount,
      payment_method: paymentMethod,
    });
  },
  trackOrderStatusChange: (
    orderId: string,
    status: string,
    previousStatus?: string,
  ) => {
    capturePostHogEvent("order_status_changed", {
      order_id: orderId,
      status,
      previous_status: previousStatus,
    });
  },
  trackWishlistToggle: (
    productId: string,
    action: "add" | "remove",
    productName?: string,
  ) => {
    capturePostHogEvent("wishlist_toggle", {
      product_id: productId,
      product_name: productName,
      action,
    });
  },
  trackSearch: (query: string, resultCount: number, filters?: unknown) => {
    capturePostHogEvent("search_performed", {
      query,
      result_count: resultCount,
      filters,
    });
  },
  trackSearchResultClick: (
    query: string,
    productId: string,
    productName: string,
    position: number,
  ) => {
    capturePostHogEvent("search_result_clicked", {
      query,
      product_id: productId,
      product_name: productName,
      position,
    });
  },
  trackSearchNoResults: (query: string) => {
    capturePostHogEvent("search_no_results", {
      query,
    });
  },
  trackCartAbandoned: (
    cartId: string,
    itemCount: number,
    totalValue: number,
    lastViewedAt: string,
  ) => {
    capturePostHogEvent("cart_abandoned", {
      cart_id: cartId,
      item_count: itemCount,
      total_value: totalValue,
      last_viewed_at: lastViewedAt,
    });
  },
  trackCartRecoveryClick: (recoveryId: string, cartId: string) => {
    capturePostHogEvent("cart_recovery_clicked", {
      recovery_id: recoveryId,
      cart_id: cartId,
    });
  },
  trackUserEngagement: (
    event: string,
    properties?: Record<string, unknown>,
  ) => {
    capturePostHogEvent(event, properties);
  },
};
