import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

import { getOrCreateCart } from "@/lib/cart";
import { getCurrentCustomerSession, getCurrentCustomerUserId } from "@/lib/customer-session";
import {
  buildCartFingerprint,
  buildCheckoutOrderMetadata,
  calculateOrderTotals,
  parseCheckoutOrderMetadata,
} from "@/lib/orders";
import prisma from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { checkoutSchema } from "@/lib/validations/checkout";

type CheckoutDbClient = Prisma.TransactionClient | typeof prisma;

export type CheckoutCartSnapshotItem = {
  imageUrl: string | null;
  name: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CheckoutOrderSummary = {
  currency: string;
  id: string;
  itemCount: number;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotalAmount: number;
  totalAmount: number;
};

type CheckoutResult =
  | {
      data: CheckoutOrderSummary;
      status: 200;
    }
  | {
      error: string;
      status: number;
    };

type CheckoutCartSnapshotResult =
  | {
      data: CheckoutCartSnapshotItem[];
    }
  | {
      error: string;
      status: number;
    };

function toCheckoutOrderSummary(order: {
  currency: string;
  id: string;
  items: { quantity: number }[];
  orderNumber: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotalAmount: number;
  totalAmount: number;
}): CheckoutOrderSummary {
  return {
    currency: order.currency,
    id: order.id,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    status: order.status,
    subtotalAmount: order.subtotalAmount,
    totalAmount: order.totalAmount,
  };
}

export async function getCheckoutCartSnapshot(
  db: CheckoutDbClient,
  cartId: string,
  userId: string,
): Promise<CheckoutCartSnapshotResult> {
  const cartItems = await db.cartItem.findMany({
    where: {
      cartId,
    },
    select: {
      productId: true,
      quantity: true,
      shopPageProductId: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (cartItems.length === 0) {
    return { error: "Your bag is empty.", status: 400 };
  }

  const checkoutProductIds = Array.from(
    new Set(cartItems.map((item) => item.shopPageProductId ?? item.productId)),
  );

  const products = await db.shopPageProduct.findMany({
    where: {
      id: {
        in: checkoutProductIds,
      },
    },
    select: {
      id: true,
      imageUrl: true,
      images: true,
      name: true,
      price: true,
    },
  });

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        imageUrl: product.imageUrl ?? product.images[0] ?? null,
        name: product.name,
        unitPrice: product.price,
      },
    ]),
  );

  const snapshotItems: CheckoutCartSnapshotItem[] = [];

  for (const item of cartItems) {
    const checkoutProductId = item.shopPageProductId ?? item.productId;
    const product = productMap.get(checkoutProductId);

    if (!product) {
      return {
        error:
          "One or more products in your bag are no longer available for checkout. Please review your bag and try again.",
        status: 409,
      };
    }

    snapshotItems.push({
      imageUrl: product.imageUrl,
      name: product.name,
      productId: checkoutProductId,
      quantity: item.quantity,
      unitPrice: product.unitPrice,
    });
  }

  return { data: snapshotItems };
}

export async function checkout(body: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return { error: "Invalid checkout details.", status: 400 };
  }

  const input: CheckoutInput = parsed.data;
  const [session, userId] = await Promise.all([
    getCurrentCustomerSession(),
    getCurrentCustomerUserId(),
  ]);

  if (!userId) {
    return { error: "Please sign in to continue to checkout.", status: 401 };
  }

  const cart = await getOrCreateCart();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const activeCart = await tx.cart.findUnique({
        where: { id: cart.id },
        select: {
          id: true,
          status: true,
        },
      });

      if (!activeCart || activeCart.status !== "ACTIVE") {
        return {
          error: "Your active bag could not be found. Please refresh and try again.",
          status: 409,
        } as const;
      }

      const snapshotResult = await getCheckoutCartSnapshot(tx, activeCart.id, userId);

      if ("error" in snapshotResult) {
        return snapshotResult;
      }

      const snapshotItems = snapshotResult.data;
      const fingerprint = buildCartFingerprint(
        snapshotItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );
      const totals = calculateOrderTotals(snapshotItems);

      const draftOrder = await tx.order.findFirst({
        where: {
          cartId: activeCart.id,
          paymentStatus: {
            in: ["FAILED", "PENDING"],
          },
          status: "PENDING",
        },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const orderMetadata = buildCheckoutOrderMetadata({
        cartFingerprint: fingerprint,
        customerEmail: input.shippingAddress.email,
        notes: input.notes,
      });

      if (draftOrder) {
        const previousMetadata = parseCheckoutOrderMetadata(draftOrder.metadata);
        const cartChanged = previousMetadata.cartFingerprint !== fingerprint;

        await tx.orderItem.deleteMany({
          where: { orderId: draftOrder.id },
        });

        const updatedOrder = await tx.order.update({
          where: { id: draftOrder.id },
          data: {
            billingAddress: input.billingAddress ?? input.shippingAddress,
            currency: "INR",
            discountAmount: totals.discountAmount,
            metadata: orderMetadata,
            paymentStatus: "PENDING",
            razorpayOrderId: cartChanged ? null : draftOrder.razorpayOrderId,
            razorpayPaymentId: null,
            razorpaySignature: null,
            shippingAddress: input.shippingAddress,
            shippingAmount: totals.shippingAmount,
            status: "PENDING",
            subtotalAmount: totals.subtotal,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            items: {
              create: snapshotItems.map((item) => ({
                lineTotal: item.quantity * item.unitPrice,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: {
            items: {
              select: {
                quantity: true,
              },
            },
          },
        });

        return {
          data: toCheckoutOrderSummary(updatedOrder),
          status: 200,
        } as const;
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: userId,
          billingAddress: input.billingAddress ?? input.shippingAddress,
          cartId: activeCart.id,
          currency: "INR",
          discountAmount: totals.discountAmount,
          metadata: orderMetadata,
          paymentStatus: "PENDING",
          shippingAddress: input.shippingAddress,
          shippingAmount: totals.shippingAmount,
          status: "PENDING",
          subtotalAmount: totals.subtotal,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          items: {
            create: snapshotItems.map((item) => ({
              lineTotal: item.quantity * item.unitPrice,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      return {
        data: toCheckoutOrderSummary(createdOrder),
        status: 200,
      } as const;
    });

    return result;
  } catch (error) {
    console.error("Checkout transaction failed:", error);

    return {
      error:
        typeof session?.user?.email === "string"
          ? "We could not prepare your order right now. Please try again."
          : "We could not prepare your order right now.",
      status: 500,
    };
  }
}
