import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

import { getOrCreateCart } from "@/lib/cart";
import eventBus from "@/lib/event-bus";
import {
  getCurrentCustomerSession,
  getCurrentCustomerUserId,
} from "@/server/auth/customer-session";
import {
  buildCartFingerprint,
  buildCheckoutOrderMetadata,
  calculateOrderTotals,
  parseCheckoutOrderMetadata,
} from "@/server/orders/utils";
import prisma from "@/lib/prisma";
import type { CheckoutInput } from "@/features/checkout/validation";
import { checkoutSchema } from "@/features/checkout/validation";

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

type CheckoutErrorResult = {
  code?: string;
  error: string;
  status: number;
  unavailableProductIds?: string[];
};

type CheckoutResult =
  | {
      data: CheckoutOrderSummary;
      status: 200;
    }
  | CheckoutErrorResult;

type CheckoutCartSnapshotResult =
  | {
      data: CheckoutCartSnapshotItem[];
    }
  | CheckoutErrorResult;

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

  type ResolvedCheckoutLine = {
    imageUrl: string | null;
    name: string;
    orderLineProductId: string;
    unitPrice: number;
  };

  const productMap = new Map<string, ResolvedCheckoutLine>(
    products.map((product) => [
      product.id,
      {
        imageUrl: product.imageUrl ?? product.images[0] ?? null,
        name: product.name,
        orderLineProductId: product.id,
        unitPrice: product.price,
      },
    ]),
  );

  const unresolvedIds = checkoutProductIds.filter((id) => !productMap.has(id));

  if (unresolvedIds.length > 0) {
    const catalogProducts = await db.product.findMany({
      where: { id: { in: unresolvedIds } },
      select: {
        id: true,
        images: true,
        name: true,
        price: true,
        slug: true,
      },
    });

    if (catalogProducts.length > 0) {
      const shopMatches = await db.shopPageProduct.findMany({
        where: {
          slug: { in: catalogProducts.map((p) => p.slug) },
        },
        select: {
          id: true,
          slug: true,
          imageUrl: true,
          images: true,
          name: true,
          price: true,
        },
      });

      const shopBySlug = new Map(shopMatches.map((sp) => [sp.slug, sp]));

      for (const catalog of catalogProducts) {
        const shop = shopBySlug.get(catalog.slug);
        if (!shop) {
          continue;
        }

        productMap.set(catalog.id, {
          imageUrl: shop.imageUrl ?? shop.images[0] ?? null,
          name: shop.name,
          orderLineProductId: shop.id,
          unitPrice: shop.price,
        });
      }
    }
  }

  const snapshotItems: CheckoutCartSnapshotItem[] = [];
  const unavailableProductIds: string[] = [];

  for (const item of cartItems) {
    const checkoutProductId = item.shopPageProductId ?? item.productId;
    const resolved = productMap.get(checkoutProductId);

    if (!resolved) {
      unavailableProductIds.push(checkoutProductId);
      continue;
    }

    snapshotItems.push({
      imageUrl: resolved.imageUrl,
      name: resolved.name,
      productId: resolved.orderLineProductId,
      quantity: item.quantity,
      unitPrice: resolved.unitPrice,
    });
  }

  if (unavailableProductIds.length > 0) {
    return {
      code: "CHECKOUT_ITEMS_UNAVAILABLE",
      error:
        unavailableProductIds.length === 1
          ? "One item in your bag is no longer available for checkout. Review your bag to continue."
          : `${unavailableProductIds.length} items in your bag are no longer available for checkout. Review your bag to continue.`,
      status: 409,
      unavailableProductIds,
    };
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
        customerUserId: userId,
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

      eventBus.emit("order.created", {
        orderId: createdOrder.id,
        userId,
        totalAmount: createdOrder.totalAmount,
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
