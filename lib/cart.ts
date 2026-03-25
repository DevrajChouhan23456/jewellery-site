import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchProductPrices } from "@/lib/prisma-helpers";

const CART_COOKIE = "cart_session";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id format (expected ObjectId)");

const quantitySchema = z.number().int().min(1).max(99);

const addItemSchema = z.object({
  productId: objectIdSchema,
  quantity: quantitySchema.optional().default(1),
});

const updateQtySchema = z.object({
  productId: objectIdSchema,
  quantity: quantitySchema,
});

const removeItemSchema = z.object({
  productId: objectIdSchema,
});

export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  const session = await auth().catch(() => null);
  const customerId =
    typeof session?.user?.id === "string" &&
    objectIdSchema.safeParse(session.user.id).success
      ? session.user.id
      : null;

  let cart = await prisma.cart.findFirst({
    where: { sessionId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        sessionId,
        customerId: customerId ?? undefined,
        status: "ACTIVE",
      },
    });
  } else if (customerId && !cart.customerId) {
    // attach customer to existing cart
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { customerId },
    });
  }

  return cart;
}

function computeTotals(items: {
  quantity: number;
  product: { price: number };
}[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price ?? 0),
    0,
  );
  return { subtotal, total: subtotal };
}

const MAX_QTY = 99;

export async function getCartResponse() {
  const cart = await getOrCreateCart();

  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, price: true, imageUrl: true } },
        },
      },
    },
  });

  const items =
    fullCart?.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.product?.name ?? "Unknown",
      price: item.product?.price ?? 0,
      imageUrl: item.product?.imageUrl ?? null,
    })) ?? [];

  const totals = computeTotals(fullCart?.items ?? []);

  return {
    cartId: cart.id,
    items,
    totals,
  };
}

export async function addItem(body: unknown) {
  try {
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return { error: parsed.error.format(), status: 400 };
    }
    const { productId, quantity } = parsed.data;

    const [price] = await fetchProductPrices([productId]);
    if (price === null) return { error: "Product not found", status: 404 };

    const cart = await getOrCreateCart();

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      select: { quantity: true, id: true },
    });

    if (existing) {
      const nextQty = Math.min(MAX_QTY, existing.quantity + quantity);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return { data: await getCartResponse(), status: 200 };
  } catch (error) {
    console.error("Cart API Error:", error);
    return { error: "Internal Server Error", status: 500 };
  }
}

export async function updateQuantity(body: unknown) {
  try {
    const parsed = updateQtySchema.safeParse(body);
    if (!parsed.success) {
      return { error: parsed.error.format(), status: 400 };
    }
    const { productId, quantity } = parsed.data;

    const cart = await getOrCreateCart();

    const updated = await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        productId,
      },
      data: { quantity: Math.min(MAX_QTY, quantity) },
    });

    if (updated.count === 0) {
      return { error: "Item not in cart", status: 404 };
    }

    return { data: await getCartResponse(), status: 200 };
  } catch (error) {
    console.error("Cart API Error:", error);
    return { error: "Internal Server Error", status: 500 };
  }
}

export async function removeItem(body: unknown) {
  try {
    const parsed = removeItemSchema.safeParse(body);
    if (!parsed.success) {
      return { error: parsed.error.format(), status: 400 };
    }
    const { productId } = parsed.data;

    const cart = await getOrCreateCart();

    const removed = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (removed.count === 0) {
      return { error: "Item not in cart", status: 404 };
    }

    return { data: await getCartResponse(), status: 200 };
  } catch (error) {
    console.error("Cart API Error:", error);
    return { error: "Internal Server Error", status: 500 };
  }
}
