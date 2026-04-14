import type { OrderStatus, PaymentStatus } from "@prisma/client";

import type { HydratedOrderProduct } from "@/server/orders/product-snapshots";

export type OrderTrackingItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    name: string;
    slug: string;
    images: string[];
    isArchived?: boolean;
  };
};

export type OrderTrackingPayload = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Record<string, unknown> | null;
  items: OrderTrackingItem[];
};

type OrderHydratedForTracking = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: unknown;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: HydratedOrderProduct;
  }>;
};

export function serializeOrderForTracking(
  order: OrderHydratedForTracking,
): OrderTrackingPayload {
  const shipping =
    order.shippingAddress !== null &&
    typeof order.shippingAddress === "object" &&
    !Array.isArray(order.shippingAddress)
      ? (order.shippingAddress as Record<string, unknown>)
      : null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    totalAmount: order.totalAmount,
    subtotalAmount: order.subtotalAmount,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippingAddress: shipping,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      product: {
        name: item.product.name,
        slug: item.product.slug,
        images: item.product.images,
        isArchived: item.product.isArchived,
      },
    })),
  };
}
