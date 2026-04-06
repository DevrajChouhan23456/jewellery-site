/**
 * Order Notification Event Listeners
 * 
 * Handles order.paid events to send email and WhatsApp notifications
 * This ensures notifications are reliably delivered even if main process crashes
 */

import eventBus from "@/lib/event-bus";
import { sendOrderConfirmationEmail } from "@/server/services/email";
import { sendOrderConfirmationWhatsApp } from "@/server/services/whatsapp";
import { posthogEvents } from "@/lib/posthog-events";
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
}
