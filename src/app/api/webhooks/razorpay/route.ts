/**
 * Razorpay Webhook Handler
 * 
 * Handles async payment events from Razorpay:
 * - payment.authorized
 * - payment.failed
 * - order.paid
 * 
 * This ensures orders are marked PAID even if client browser crashes
 */

import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import eventBus from "@/lib/event-bus";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

type RazorpayWebhookEvent = {
  event: string;
  created_at: number;
  entity: {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status?: string;
    method?: string;
    description?: string;
    amount_paid?: number;
    amount_due?: number;
    currency_code?: string;
    customer_id?: string;
    customer_details?: {
      name: string;
      email: string;
      contact: string;
    };
    order_id?: string;
    payment_id?: string;
    signature?: string;
  };
};

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret is configured
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Get signature from header
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      console.warn("[Webhook] Missing x-razorpay-signature header");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET)) {
      console.warn("[Webhook] Invalid signature for Razorpay webhook");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    let payload: RazorpayWebhookEvent;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error("[Webhook] Failed to parse webhook payload", error);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${payload.event}`, {
      orderId: payload.entity.receipt,
      paymentId: payload.entity.id,
    });

    // Handle different webhook events
    switch (payload.event) {
      case "payment.authorized":
      case "payment.captured": {
        // Order ID is stored in receipt field
        const orderId = payload.entity.receipt;
        if (!orderId) {
          console.warn("[Webhook] No receipt/orderId in payment webhook");
          return NextResponse.json({ success: true });
        }

        // Check if already processed (idempotency)
        const webhookIdempotencyKey = `webhook:razorpay:${payload.entity.id}`;
        const processed = await redis.get(webhookIdempotencyKey);

        if (processed) {
          console.log(
            `[Webhook] Webhook already processed for payment ${payload.entity.id}`
          );
          return NextResponse.json({ success: true });
        }

        // Update order to PAID if webhook amount matches
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: { select: { email: true, phone: true, name: true } },
            items: {
              include: {
                product: { select: { name: true, price: true } },
              },
            },
          },
        });

        if (!order) {
          console.warn(`[Webhook] Order ${orderId} not found`);
          return NextResponse.json({ success: true });
        }

        // Verify amount (webhook amount is in paise)
        const webhookAmount = payload.entity.amount;
        const orderAmount = order.totalAmount * 100; // Convert to paise

        if (webhookAmount !== orderAmount) {
          console.error(
            `[Webhook] Amount mismatch for order ${orderId}: webhook=${webhookAmount}, order=${orderAmount}`
          );
          // Don't fail the webhook, log for investigation
          return NextResponse.json({ success: true });
        }

        // Mark order as PAID and emit event
        if (order.paymentStatus !== "PAID") {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: "PAID",
                razorpayPaymentId: payload.entity.id,
                status: order.status === "PENDING" ? "CONFIRMED" : order.status,
              },
            });

            // Mark cart as checked out
            if (order.cartId) {
              await tx.cartItem.deleteMany({
                where: { cartId: order.cartId },
              });
              await tx.cart.update({
                where: { id: order.cartId },
                data: { status: "CHECKED_OUT" },
              });
            }
          });

          // Emit event for notification handlers
          eventBus.emit("order.paid", {
            orderId: order.id,
            userId: order.userId as string,
            paymentMethod: "razorpay",
          });

          console.log(
            `[Webhook] Order ${orderId} marked as PAID via webhook`,
            { paymentId: payload.entity.id }
          );
        }

        // Mark webhook as processed for idempotency
        await redis.setex(webhookIdempotencyKey, 24 * 60 * 60, "1");

        return NextResponse.json({ success: true });
      }

      case "payment.failed": {
        const orderId = payload.entity.receipt;
        if (!orderId) {
          return NextResponse.json({ success: true });
        }

        // Update order status to FAILED for user visibility
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (existingOrder && existingOrder.paymentStatus === "PENDING") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              status: "PENDING", // Keep order for retry
            },
          });

          console.log(`[Webhook] Order ${orderId} payment failed`, {
            reason: payload.entity.description,
          });
        }

        return NextResponse.json({ success: true });
      }

      default:
        // Log unknown events but don't fail
        console.log(`[Webhook] Unhandled webhook event: ${payload.event}`);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("[Webhook] Error processing Razorpay webhook", error);
    // Always return 200 to prevent Razorpay retries for server errors
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
