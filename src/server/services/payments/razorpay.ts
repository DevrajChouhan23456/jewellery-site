import prisma from "@/lib/prisma";
import {
  getPublicKey,
  getRazorpayClient,
  verifySignature,
} from "@/server/payments/razorpay";
import {
  buildCartFingerprint,
  calculateOrderTotals,
  parseCheckoutOrderMetadata,
} from "@/server/orders/utils";
import { getCheckoutCartSnapshot } from "@/server/services/checkout";

type PaymentServiceResult<T> =
  | {
      data: T;
      status: number;
    }
  | {
      error: string;
      status: number;
    };

type OrderAccessRecord = {
  cartId: string | null;
  metadata: unknown;
};

export type RazorpayOrderPayload = {
  amount: number;
  currency: string;
  key: string;
  orderId: string;
  razorpayOrderId: string;
};

export type RazorpayVerificationPayload = {
  message: string;
  orderId: string;
};

async function userOwnsOrder(userId: string, order: OrderAccessRecord) {
  const metadata = parseCheckoutOrderMetadata(order.metadata);

  if (metadata.customerUserId) {
    return metadata.customerUserId === userId;
  }

  if (!order.cartId) {
    return false;
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: order.cartId,
      userId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(cartItem);
}

export async function createRazorpayPaymentOrder(input: {
  orderId: string;
  userId: string;
}): Promise<PaymentServiceResult<RazorpayOrderPayload>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!order) {
      return { error: "Order not found.", status: 404 };
    }

    const ownedByUser = await userOwnsOrder(input.userId, order);

    if (!ownedByUser) {
      return { error: "Order not found.", status: 404 };
    }

    if (order.paymentStatus === "PAID") {
      return { error: "This order has already been paid.", status: 400 };
    }

    if (order.status === "CANCELLED") {
      return { error: "This order can no longer be paid.", status: 400 };
    }

    if (order.items.length === 0) {
      return { error: "This order has no items to pay for.", status: 409 };
    }

    const metadata = parseCheckoutOrderMetadata(order.metadata);

    if (order.cartId && metadata.cartFingerprint) {
      const snapshotResult = await getCheckoutCartSnapshot(
        prisma,
        order.cartId,
        input.userId,
      );

      if ("error" in snapshotResult) {
        return snapshotResult;
      }

      const currentFingerprint = buildCartFingerprint(
        snapshotResult.data.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );

      if (currentFingerprint !== metadata.cartFingerprint) {
        return {
          error:
            "Your bag has changed since checkout. Please review your order again before paying.",
          status: 409,
        };
      }
    }

    const totals = calculateOrderTotals(order.items, {
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      taxAmount: order.taxAmount,
    });

    if (totals.totalAmount <= 0) {
      return { error: "Invalid payable amount.", status: 400 };
    }

    if (
      totals.subtotal !== order.subtotalAmount ||
      totals.totalAmount !== order.totalAmount
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotalAmount: totals.subtotal,
          totalAmount: totals.totalAmount,
        },
      });
    }

    const publicKey = getPublicKey();

    if (!publicKey) {
      return { error: "Payment gateway is not configured.", status: 500 };
    }

    if (order.razorpayOrderId) {
      return {
        data: {
          amount: totals.totalAmount * 100,
          currency: "INR",
          key: publicKey,
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
        },
        status: 200,
      };
    }

    const client = getRazorpayClient();
    const razorpayOrder = await client.orders.create({
      amount: totals.totalAmount * 100,
      currency: "INR",
      notes: { orderNumber: order.orderNumber },
      receipt: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return {
      data: {
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        key: publicKey,
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);

    return {
      error: "We could not start payment right now. Please try again.",
      status: 500,
    };
  }
}

export async function verifyRazorpayPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
}): Promise<PaymentServiceResult<RazorpayVerificationPayload>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        cartId: true,
        id: true,
        metadata: true,
        paymentStatus: true,
        razorpayOrderId: true,
        status: true,
      },
    });

    if (!order) {
      return { error: "Order not found.", status: 404 };
    }

    const ownedByUser = await userOwnsOrder(input.userId, order);

    if (!ownedByUser) {
      return { error: "Order not found.", status: 404 };
    }

    if (order.paymentStatus === "PAID") {
      return {
        data: {
          message: "Payment already verified.",
          orderId: order.id,
        },
        status: 200,
      };
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== input.razorpayOrderId
    ) {
      return { error: "Payment order mismatch.", status: 400 };
    }

    const isValid = verifySignature({
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    });

    if (!isValid) {
      return { error: "Invalid payment signature.", status: 400 };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        },
      });

      if (order.cartId) {
        await tx.cartItem.deleteMany({
          where: {
            cartId: order.cartId,
            userId: input.userId,
          },
        });
      }
    });

    return {
      data: {
        message: "Payment verified.",
        orderId: order.id,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Failed to verify Razorpay payment:", error);

    return {
      error:
        "We could not confirm your payment right now. Please contact support if money was debited.",
      status: 500,
    };
  }
}
