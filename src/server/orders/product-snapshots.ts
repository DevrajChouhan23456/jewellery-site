import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export const orderProductSummarySelect = {
  id: true,
  name: true,
  slug: true,
  images: true,
} satisfies Prisma.ShopPageProductSelect;

type ShopPageProductSummary = Prisma.ShopPageProductGetPayload<{
  select: typeof orderProductSummarySelect;
}>;

export type HydratedOrderProduct =
  | (ShopPageProductSummary & { isArchived?: false })
  | {
      id: string;
      name: string;
      slug: string;
      images: string[];
      isArchived: true;
    };

type OrderWithProductRefs = {
  items: Array<{ productId: string }>;
};

export type HydratedOrder<TOrder extends OrderWithProductRefs> = Omit<
  TOrder,
  "items"
> & {
  items: Array<TOrder["items"][number] & { product: HydratedOrderProduct }>;
};

function createArchivedOrderProduct(productId: string): HydratedOrderProduct {
  return {
    id: productId,
    name: "Archived product",
    slug: "",
    images: [],
    isArchived: true,
  };
}

export async function hydrateOrdersWithShopPageProducts<
  TOrder extends OrderWithProductRefs,
>(orders: readonly TOrder[]): Promise<Array<HydratedOrder<TOrder>>> {
  const productIds = Array.from(
    new Set(
      orders.flatMap((order) => order.items.map((item) => item.productId)),
    ),
  );

  const products =
    productIds.length === 0
      ? []
      : await prisma.shopPageProduct.findMany({
          where: { id: { in: productIds } },
          select: orderProductSummarySelect,
        });

  const productMap = new Map(products.map((product) => [product.id, product]));

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      product:
        productMap.get(item.productId) ??
        createArchivedOrderProduct(item.productId),
    })),
  })) as Array<HydratedOrder<TOrder>>;
}

export async function hydrateOrderWithShopPageProducts<
  TOrder extends OrderWithProductRefs,
>(order: TOrder | null): Promise<HydratedOrder<TOrder> | null> {
  if (!order) {
    return null;
  }

  const [hydratedOrder] = await hydrateOrdersWithShopPageProducts([order]);
  return hydratedOrder ?? null;
}
