import prisma from "@/lib/prisma";
import { getCurrentCustomerUserId } from "@/lib/customer-session";
import { parseCheckoutOrderMetadata } from "@/server/orders/utils";
import { hydrateOrderWithShopPageProducts } from "@/server/orders/product-snapshots";

export async function getCurrentUserOrders() {
  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    return [];
  }

  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return allOrders.filter((order) => {
    const metadata = parseCheckoutOrderMetadata(order.metadata);

    if (order.userId === userId || metadata.customerUserId === userId) {
      return true;
    }

    return false;
  });
}

export async function getCurrentUserOrderById(orderId: string) {
  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const hydratedOrder = await hydrateOrderWithShopPageProducts(order);

  if (!hydratedOrder) {
    return null;
  }

  const metadata = parseCheckoutOrderMetadata(order.metadata);

  if (order.userId === userId || metadata.customerUserId === userId) {
    return hydratedOrder;
  }

  return null;
}
