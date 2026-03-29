import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { getCurrentCustomerUserId } from "@/lib/customer-session";
import prisma from "@/lib/prisma";
import {
  addToCartSchema,
  MAX_CART_ITEM_QUANTITY,
  removeCartItemSchema,
  updateCartQuantitySchema,
} from "@/lib/validations/cart";

const CART_COOKIE = "cart_session";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ResolvedCartProduct = {
  id: string;
  imageUrl: string | null;
  kind: "product" | "shopPageProduct";
  name: string;
  price: number;
};

type CartItemRecord = {
  productId: string;
  quantity: number;
  shopPageProductId: string | null;
};

type CartResponseItem = {
  imageUrl: string | null;
  name: string;
  price: number;
  productId: string;
  quantity: number;
};

type CartResponse = {
  cartId: string;
  items: CartResponseItem[];
  totals: {
    subtotal: number;
    total: number;
  };
};

type CartOperationResult =
  | {
      data: CartResponse;
      status: number;
    }
  | {
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
      status: number;
    };

async function getCurrentUserId() {
  return getCurrentCustomerUserId();
}

export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  const userId = await getCurrentUserId();

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  let cart = await prisma.cart.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { sessionId },
        ...(userId ? [{ customerId: userId }] : []),
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        sessionId,
        customerId: userId ?? undefined,
        status: "ACTIVE",
      },
    });
  } else if (cart.sessionId !== sessionId || (userId && !cart.customerId)) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        sessionId,
        customerId: cart.customerId ?? userId ?? undefined,
      },
    });
  }

  return cart;
}

async function resolveProduct(productId: string): Promise<ResolvedCartProduct | null> {
  const [shopPageProduct, product] = await Promise.all([
    prisma.shopPageProduct.findUnique({
      where: { id: productId },
      select: {
        id: true,
        imageUrl: true,
        images: true,
        name: true,
        price: true,
      },
    }),
    prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        images: true,
        name: true,
        price: true,
      },
    }),
  ]);

  if (shopPageProduct) {
    return {
      id: shopPageProduct.id,
      imageUrl: shopPageProduct.imageUrl ?? shopPageProduct.images[0] ?? null,
      kind: "shopPageProduct",
      name: shopPageProduct.name,
      price: shopPageProduct.price,
    };
  }

  if (product) {
    return {
      id: product.id,
      imageUrl: product.images[0] ?? null,
      kind: "product",
      name: product.name,
      price: product.price,
    };
  }

  return null;
}

async function buildCartResponse(
  cartId: string,
  items: CartItemRecord[],
): Promise<CartResponse> {
  const shopPageProductIds = Array.from(
    new Set(
      items
        .flatMap((item) => [item.shopPageProductId, item.productId])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const productIds = Array.from(new Set(items.map((item) => item.productId)));

  const [shopPageProducts, products] = await Promise.all([
    prisma.shopPageProduct.findMany({
      where: { id: { in: shopPageProductIds } },
      select: {
        id: true,
        imageUrl: true,
        images: true,
        name: true,
        price: true,
      },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        images: true,
        name: true,
        price: true,
      },
    }),
  ]);

  const shopPageProductMap = new Map(
    shopPageProducts.map((product) => [
      product.id,
      {
        imageUrl: product.imageUrl ?? product.images[0] ?? null,
        name: product.name,
        price: product.price,
      },
    ]),
  );

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        imageUrl: product.images[0] ?? null,
        name: product.name,
        price: product.price,
      },
    ]),
  );

  const responseItems = items.map((item) => {
    const resolvedProduct =
      (item.shopPageProductId
        ? shopPageProductMap.get(item.shopPageProductId)
        : undefined) ??
      shopPageProductMap.get(item.productId) ??
      productMap.get(item.productId);

    return {
      imageUrl: resolvedProduct?.imageUrl ?? null,
      name: resolvedProduct?.name ?? "Unknown Product",
      price: resolvedProduct?.price ?? 0,
      productId: item.shopPageProductId ?? item.productId,
      quantity: item.quantity,
    } satisfies CartResponseItem;
  });

  const subtotal = responseItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  return {
    cartId,
    items: responseItems,
    totals: {
      subtotal,
      total: subtotal,
    },
  };
}

async function getCartItems(cartId: string, userId: string) {
  return prisma.cartItem.findMany({
    where: {
      cartId,
      userId,
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
}

export async function getCart(): Promise<CartOperationResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Unauthorized", status: 401 };
    }

    const cart = await getOrCreateCart();
    const items = await getCartItems(cart.id, userId);

    return {
      data: await buildCartResponse(cart.id, items),
      status: 200,
    };
  } catch (error) {
    console.error("Failed to read cart:", error);
    return { error: "Unable to load your cart right now.", status: 500 };
  }
}

export async function addItem(body: unknown): Promise<CartOperationResult> {
  try {
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return {
        error: "Invalid add-to-cart payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
        status: 400,
      };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Unauthorized", status: 401 };
    }

    const resolvedProduct = await resolveProduct(parsed.data.productId);

    if (!resolvedProduct) {
      return { error: "Product not found.", status: 404 };
    }

    const cart = await getOrCreateCart();
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: resolvedProduct.id,
        userId,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: Math.min(
            MAX_CART_ITEM_QUANTITY,
            existing.quantity + parsed.data.quantity,
          ),
          ...(resolvedProduct.kind === "shopPageProduct"
            ? { shopPageProductId: resolvedProduct.id }
            : {}),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: resolvedProduct.id,
          quantity: parsed.data.quantity,
          ...(resolvedProduct.kind === "shopPageProduct"
            ? { shopPageProductId: resolvedProduct.id }
            : {}),
          userId,
        },
      });
    }

    const items = await getCartItems(cart.id, userId);

    return {
      data: await buildCartResponse(cart.id, items),
      status: existing ? 200 : 201,
    };
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return { error: "Unable to add this item to your cart right now.", status: 500 };
  }
}

export async function updateQuantity(body: unknown): Promise<CartOperationResult> {
  try {
    const parsed = updateCartQuantitySchema.safeParse(body);

    if (!parsed.success) {
      return {
        error: "Invalid cart update payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
        status: 400,
      };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Unauthorized", status: 401 };
    }

    const cart = await getOrCreateCart();
    const updated = await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        productId: parsed.data.productId,
        userId,
      },
      data: {
        quantity: parsed.data.quantity,
      },
    });

    if (updated.count === 0) {
      return { error: "Item not in cart.", status: 404 };
    }

    const items = await getCartItems(cart.id, userId);

    return {
      data: await buildCartResponse(cart.id, items),
      status: 200,
    };
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    return { error: "Unable to update that cart item right now.", status: 500 };
  }
}

export async function removeItem(body: unknown): Promise<CartOperationResult> {
  try {
    const parsed = removeCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return {
        error: "Invalid cart removal payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
        status: 400,
      };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Unauthorized", status: 401 };
    }

    const cart = await getOrCreateCart();
    const removed = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: parsed.data.productId,
        userId,
      },
    });

    if (removed.count === 0) {
      return { error: "Item not in cart.", status: 404 };
    }

    const items = await getCartItems(cart.id, userId);

    return {
      data: await buildCartResponse(cart.id, items),
      status: 200,
    };
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    return { error: "Unable to remove that item right now.", status: 500 };
  }
}
