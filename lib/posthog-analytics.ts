/**
 * PostHog Analytics Setup
 * 
 * To integrate PostHog:
 * 1. Install: npm install posthog-js
 * 2. Add to package.json dependencies
 * 3. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local
 * 4. Add this to app provider component
 * 
 * Example environment variables:
 * NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
 * NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
 */

"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // PostHog initialization
    const initPostHog = async () => {
      try {
        // Check if PostHog already exists (from CDN or other source)
        if (typeof window !== "undefined" && (window as any).posthog) {
          const posthog = (window as any).posthog;
          
          // Track page views
          posthog.pageView();
          
          // Custom events
          posthog.capture("dashboard_visited", {
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("PostHog initialization error:", error);
      }
    };

    initPostHog();
  }, []);

  return children;
}

/**
 * Utility functions for PostHog analytics
 */
export const posthogEvents = {
  /**
   * Track user registration/signup
   */
  trackUserSignup: (userId: string, method: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("user_signup", {
        user_id: userId,
        method, // 'email', 'phone', 'google', etc.
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track user login
   */
  trackUserLogin: (userId: string, method: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("user_login", {
        user_id: userId,
        method,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track product view with more details
   */
  trackProductView: (productId: string, productName: string, category?: string, price?: number) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("product_viewed", {
        product_id: productId,
        product_name: productName,
        category,
        price,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track add to cart with more context
   */
  trackAddToCart: (productId: string, quantity: number, productName?: string, price?: number) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("cart_add", {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track remove from cart
   */
  trackRemoveFromCart: (productId: string, quantity: number, productName?: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("cart_remove", {
        product_id: productId,
        product_name: productName,
        quantity,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track cart view
   */
  trackCartView: (cartId: string, itemCount: number, totalValue: number) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("cart_viewed", {
        cart_id: cartId,
        item_count: itemCount,
        total_value: totalValue,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track checkout initiation
   */
  trackCheckoutStart: (cartId: string, itemCount: number, totalValue: number) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("checkout_started", {
        cart_id: cartId,
        item_count: itemCount,
        total_value: totalValue,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track payment method selection
   */
  trackPaymentMethodSelected: (method: string, orderId: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("payment_method_selected", {
        method, // 'razorpay', 'cod', etc.
        order_id: orderId,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track payment initiation
   */
  trackPaymentInitiated: (orderId: string, amount: number, method: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("payment_initiated", {
        order_id: orderId,
        amount,
        method,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track payment success
   */
  trackPaymentSuccess: (orderId: string, amount: number, method: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("payment_success", {
        order_id: orderId,
        amount,
        method,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track payment failure
   */
  trackPaymentFailed: (orderId: string, amount: number, method: string, error?: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("payment_failed", {
        order_id: orderId,
        amount,
        method,
        error,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track checkout conversion
   */
  trackCheckout: (orderId: string, totalAmount: number, itemCount?: number, paymentMethod?: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("checkout_complete", {
        order_id: orderId,
        total_amount: totalAmount,
        item_count: itemCount,
        payment_method: paymentMethod,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track order status change
   */
  trackOrderStatusChange: (orderId: string, status: string, previousStatus?: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("order_status_changed", {
        order_id: orderId,
        status,
        previous_status: previousStatus,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track wishlist add/remove
   */
  trackWishlistToggle: (productId: string, action: 'add' | 'remove', productName?: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("wishlist_toggle", {
        product_id: productId,
        product_name: productName,
        action,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track search query
   */
  trackSearch: (query: string, resultCount: number, filters?: any) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("search_performed", {
        query,
        result_count: resultCount,
        filters,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track search result click
   */
  trackSearchResultClick: (query: string, productId: string, productName: string, position: number) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("search_result_clicked", {
        query,
        product_id: productId,
        product_name: productName,
        position,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track no search results
   */
  trackSearchNoResults: (query: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("search_no_results", {
        query,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track cart abandonment
   */
  trackCartAbandoned: (cartId: string, itemCount: number, totalValue: number, lastViewedAt: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("cart_abandoned", {
        cart_id: cartId,
        item_count: itemCount,
        total_value: totalValue,
        last_viewed_at: lastViewedAt,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track cart recovery click
   */
  trackCartRecoveryClick: (recoveryId: string, cartId: string) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("cart_recovery_clicked", {
        recovery_id: recoveryId,
        cart_id: cartId,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Track user engagement events
   */
  trackUserEngagement: (event: string, properties?: any) => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  },
};
