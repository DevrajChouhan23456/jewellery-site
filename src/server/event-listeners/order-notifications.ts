/**
 * Order notification listeners: payment confirmation and fulfilment status updates.
 */

import eventBus from "@/lib/event-bus";
import { posthogEvents } from "@/lib/posthog-events";
import { parseCheckoutOrderMetadata } from "@/server/orders/utils";
import { getCustomerStatusNotificationCopy } from "@/server/orders/customer-status-messages";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "@/server/services/email";
import {
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
} from "@/server/services/whatsapp";
import prisma from "@/lib/prisma";

function logNotificationError(error: Error, context: string) {
  console.error(`[Order Notifications] ${context}:`, {
    message: error.message,
    stack: error.stack,
  });
  // In production, send to error tracking service (e.g., Sentry)
}

/**
 * Register event listeners for order notifications
 * Call this once on application startup
 */
export function registerOrderNotificationListeners() {
  eventBus.on("order.paid", async (data) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: {
          user: {
            select: { email: true, phone: true, name: true },
          },
          items: {
            include: {
              product: {
                select: { name: true, price: true },
              },
            },
          },
        },
      });

      if (!order) {
        logNotificationError(
          new Error(`Order ${data.orderId} not found`),
          "order-paid listener"
        );
        return;
      }

      // Send email confirmation
      if (order.user?.email) {
        try {
          await sendOrderConfirmationEmail(order.user.email, {
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            items: order.items,
          });
        } catch (error) {
          logNotificationError(
            error instanceof Error ? error : new Error(String(error)),
            `Email notification for order ${data.orderId}`
          );
        }
      }

      // Send WhatsApp confirmation
      if (order.user?.phone && !order.user.phone.startsWith("google-")) {
        try {
          await sendOrderConfirmationWhatsApp(order.user.phone, {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
          });
        } catch (error) {
          logNotificationError(
            error instanceof Error ? error : new Error(String(error)),
            `WhatsApp notification for order ${data.orderId}`
          );
        }
      }

      // Track in analytics
      try {
        posthogEvents.trackPaymentSuccess(
          order.id,
          order.totalAmount / 100,
          data.paymentMethod
        );
        posthogEvents.trackCheckout(
          order.id,
          order.totalAmount / 100,
          order.items.length,
          data.paymentMethod
        );
        posthogEvents.trackOrderStatusChange(order.id, order.status);
      } catch (error) {
        logNotificationError(
          error instanceof Error ? error : new Error(String(error)),
          `Analytics tracking for order ${data.orderId}`
        );
      }
    } catch (error) {
      logNotificationError(
        error instanceof Error ? error : new Error(String(error)),
        "order-paid event listener"
      );
    }
  });

  eventBus.on("order.statusChanged", async (data) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: {
          id: true,
          orderNumber: true,
          paymentStatus: true,
          metadata: true,
          user: {
            select: { email: true, phone: true, name: true },
          },
        },
      });

      if (!order) {
        logNotificationError(
          new Error(`Order ${data.orderId} not found`),
          "order-status-changed listener",
        );
        return;
      }

      const metadata = parseCheckoutOrderMetadata(order.metadata);
      const emailTo =
        order.user?.email?.trim() ||
        metadata.customerEmail?.trim() ||
        null;

      const copy = getCustomerStatusNotificationCopy(data.newStatus);
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
      const trackUrl = `${baseUrl}/track/${encodeURIComponent(order.orderNumber)}`;

      if (emailTo) {
        try {
          await sendOrderStatusUpdateEmail(emailTo, {
            orderNumber: order.orderNumber,
            statusLabel: copy.label,
            statusDetail: copy.detail,
            trackUrl,
          });
        } catch (error) {
          logNotificationError(
            error instanceof Error ? error : new Error(String(error)),
            `Status email for order ${data.orderId}`,
          );
        }
      }

      const phone = order.user?.phone;
      if (phone && !phone.startsWith("google-")) {
        try {
          await sendOrderStatusUpdateWhatsApp(phone, {
            orderNumber: order.orderNumber,
            statusLine: copy.whatsappStatusLine,
            detail: copy.detail,
            trackUrl,
          });
        } catch (error) {
          logNotificationError(
            error instanceof Error ? error : new Error(String(error)),
            `Status WhatsApp for order ${data.orderId}`,
          );
        }
      }

      try {
        posthogEvents.trackOrderStatusChange(order.id, data.newStatus);
      } catch (error) {
        logNotificationError(
          error instanceof Error ? error : new Error(String(error)),
          `Analytics for order status ${data.orderId}`,
        );
      }
    } catch (error) {
      logNotificationError(
        error instanceof Error ? error : new Error(String(error)),
        "order-status-changed event listener",
      );
    }
  });
}
