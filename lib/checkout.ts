import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { fetchProductPrices } from "@/lib/prisma-helpers";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format (expected ObjectId)");

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(20),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().max(500).optional(),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

function computeTotals(items: { quantity: number; product: { price: number } }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price ?? 0),
    0,
  );
  const taxAmount = 0;
  const shippingAmount = 0;
  const discountAmount = 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount + shippingAmount);
  return { subtotal, taxAmount, shippingAmount, discountAmount, totalAmount };
}

export async function checkout(body: unknown) {
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.format(), status: 400 };
  }
  const input: CheckoutInput = parsed.data;

  // Attach customer if present
  const session = await auth().catch(() => null);
  const customerId =
    typeof session?.user?.id === "string" && objectIdSchema.safeParse(session.user.id).success
      ? session.user.id
      : null;

  const cart = await getOrCreateCart();

  // All critical writes in a transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-read cart with items and products inside the transaction for consistency
      const fullCart = await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, price: true } },
            },
          },
        },
      });

      if (!fullCart) {
        throw new Error("Cart not found");
      }

      if (fullCart.items.length === 0) {
        return { error: "Cart is empty", status: 400 } as const;
      }

      // If an order already exists for this cart, return it to avoid duplicates
      const existingOrder = await tx.order.findFirst({
        where: { cartId: fullCart.id },
        select: { id: true, orderNumber: true, totalAmount: true, status: true },
      });
      if (existingOrder) {
        return { data: existingOrder, status: 200 } as const;
      }

      // Validate that every product still exists
      for (const item of fullCart.items) {
        if (!item.product) {
          return { error: `Product no longer available (id: ${item.productId})`, status: 409 } as const;
        }
      }

      // Refresh prices in bulk to avoid stale reads
      const refreshedPrices = await fetchProductPrices(fullCart.items.map((i) => i.productId));
      fullCart.items.forEach((item, idx) => {
        const fresh = refreshedPrices[idx];
        if (fresh !== null) item.product!.price = fresh;
      });

      const totals = computeTotals(fullCart.items);

      const order = await tx.order.create({
        data: {
          customerId: customerId ?? undefined,
          cartId: fullCart.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          currency: "INR",
          subtotalAmount: totals.subtotal,
          taxAmount: totals.taxAmount,
          shippingAmount: totals.shippingAmount,
          discountAmount: totals.discountAmount,
          totalAmount: totals.totalAmount,
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress ?? input.shippingAddress,
          metadata: input.notes ? { notes: input.notes } : undefined,
          items: {
            create: fullCart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product!.price,
              lineTotal: item.quantity * item.product!.price,
            })),
          },
        },
        select: { id: true, orderNumber: true, totalAmount: true, status: true },
      });

      await tx.cart.update({
        where: { id: fullCart.id },
        data: { status: "CHECKED_OUT" },
      });

      return { data: order, status: 200 } as const;
    });

    return result;
  } catch (error) {
    console.error("Checkout transaction failed.");
    return { error: "An unexpected error occurred during checkout.", status: 500 };
  }
}
