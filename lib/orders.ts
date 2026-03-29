import { z } from "zod";

import { objectIdSchema } from "@/lib/validations/cart";

export type OrderSnapshotItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

const checkoutOrderMetadataSchema = z.object({
  cartFingerprint: z.string().trim().min(1).optional(),
  customerEmail: z.string().trim().email().optional(),
  customerUserId: objectIdSchema.optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CheckoutOrderMetadata = z.infer<typeof checkoutOrderMetadataSchema>;

export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  extra: {
    taxAmount?: number;
    shippingAmount?: number;
    discountAmount?: number;
  } = {},
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const taxAmount = extra.taxAmount ?? 0;
  const shippingAmount = extra.shippingAmount ?? 0;
  const discountAmount = extra.discountAmount ?? 0;
  const totalAmount = Math.max(
    0,
    subtotal - discountAmount + taxAmount + shippingAmount,
  );

  return {
    discountAmount,
    shippingAmount,
    subtotal,
    taxAmount,
    totalAmount,
  };
}

export function buildCartFingerprint(items: OrderSnapshotItem[]) {
  return items
    .slice()
    .sort((left, right) => left.productId.localeCompare(right.productId))
    .map((item) => `${item.productId}:${item.quantity}:${item.unitPrice}`)
    .join("|");
}

export function parseCheckoutOrderMetadata(
  metadata: unknown,
): CheckoutOrderMetadata {
  const parsed = checkoutOrderMetadataSchema.safeParse(metadata);
  return parsed.success ? parsed.data : {};
}

export function buildCheckoutOrderMetadata(input: CheckoutOrderMetadata) {
  const metadata = {
    ...(input.cartFingerprint ? { cartFingerprint: input.cartFingerprint } : {}),
    ...(input.customerEmail ? { customerEmail: input.customerEmail } : {}),
    ...(input.customerUserId ? { customerUserId: input.customerUserId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
