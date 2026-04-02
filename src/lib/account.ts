import prisma from "@/lib/prisma";
import { parseCheckoutOrderMetadata } from "@/lib/orders";
import { getCurrentCustomerUserId } from "@/lib/customer-session";

export async function getCurrentUserOrders() {
  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    return [];
  }

  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return allOrders.filter((order) => {
    if (order.userId === userId) {
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
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const metadata = parseCheckoutOrderMetadata(order.metadata);

  if (order.userId === userId) {
    return order;
  }

  return null;
}
