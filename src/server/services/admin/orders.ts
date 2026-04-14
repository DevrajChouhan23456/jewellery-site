import type { OrderStatus, Prisma } from "@prisma/client";

import eventBus from "@/lib/event-bus";
import prisma from "@/lib/prisma";
import {
  hydrateOrderWithShopPageProducts,
  hydrateOrdersWithShopPageProducts,
} from "@/server/orders/product-snapshots";

type TrendingProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salesChange: number;
  images: string[];
};

const adminOrderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
    },
  },
} satisfies Prisma.OrderSelect;

const adminOrderDetailSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  currency: true,
  subtotalAmount: true,
  taxAmount: true,
  shippingAmount: true,
  discountAmount: true,
  totalAmount: true,
  razorpayOrderId: true,
  razorpayPaymentId: true,
  razorpaySignature: true,
  shippingAddress: true,
  billingAddress: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
    },
  },
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
    },
  },
} satisfies Prisma.OrderSelect;

export async function getAdminOrders({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  paymentStatus = "",
  dateFrom = "",
  dateTo = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  // Search filter
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Status filters
  if (status && status !== "ALL") {
    where.status = status as Prisma.EnumOrderStatusFilter;
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter;
  }

  // Date filters
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: adminOrderListSelect,
    }),
    prisma.order.count({ where }),
  ]);

  const hydratedOrders = await hydrateOrdersWithShopPageProducts(orders);

  // Transform dates to strings for frontend compatibility
  const transformedOrders = hydratedOrders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return {
    orders: transformedOrders,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getAdminOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: adminOrderDetailSelect,
  });

  return hydrateOrderWithShopPageProducts(order);
}

export async function updateOrderStatus(id: string, status: string) {
  const nextStatus = status as OrderStatus;

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new Error("Order not found.");
  }

  if (existing.status === nextStatus) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: adminOrderListSelect,
    });
    if (!order) {
      throw new Error("Order not found.");
    }
    const hydratedOrder = await hydrateOrderWithShopPageProducts(order);
    if (!hydratedOrder) {
      throw new Error("Updated order could not be hydrated.");
    }
    return {
      ...hydratedOrder,
      createdAt: hydratedOrder.createdAt.toISOString(),
      updatedAt: hydratedOrder.updatedAt.toISOString(),
    };
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: nextStatus },
    select: adminOrderListSelect,
  });

  eventBus.emit("order.statusChanged", {
    orderId: order.id,
    previousStatus: existing.status,
    newStatus: nextStatus,
  });

  const hydratedOrder = await hydrateOrderWithShopPageProducts(order);

  if (!hydratedOrder) {
    throw new Error("Updated order could not be hydrated.");
  }

  return {
    ...hydratedOrder,
    createdAt: hydratedOrder.createdAt.toISOString(),
    updatedAt: hydratedOrder.updatedAt.toISOString(),
  };
}

export async function getAdminDashboardStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    ordersToday,
    revenueToday,
    topSellingProducts,
  ] = await prisma.$transaction([
    // Total revenue (paid orders)
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    // Total orders
    prisma.order.count(),
    // Total users
    prisma.user.count(),
    // Orders today
    prisma.order.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    }),
    // Revenue today
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfDay },
      },
      _sum: { totalAmount: true },
    }),
    // Top selling products (by order items)
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Get product details for top selling
  const topProductIds = topSellingProducts.map(p => p.productId);
  const topProducts = topProductIds.length > 0
    ? await prisma.shopPageProduct.findMany({
        where: { id: { in: topProductIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
        },
      })
    : [];

  // Combine with quantities
  const topSellingWithDetails = topSellingProducts.map(item => {
    const product = topProducts.find(p => p.id === item.productId);
    return {
      ...product,
      totalSold: item._sum?.quantity || 0,
    };
  });

  return {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalOrders,
    totalUsers,
    ordersToday,
    revenueToday: revenueToday._sum.totalAmount || 0,
    topSellingProducts: topSellingWithDetails,
  };
}

export async function getRecentOrders(limit: number = 10) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: adminOrderListSelect,
  });

  const hydratedOrders = await hydrateOrdersWithShopPageProducts(orders);

  // Transform dates to strings for frontend compatibility
  const transformedOrders = hydratedOrders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return transformedOrders;
}

export async function getAdminAnalytics() {
  const [ordersByStatus, paidOrderItems] = await prisma.$transaction([
    // Orders by status
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Top categories by revenue (simplified)
    prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: "PAID",
        },
      },
      select: {
        productId: true,
        lineTotal: true,
      },
    }),
  ]);

  const categoryProducts =
    paidOrderItems.length === 0
      ? []
      : await prisma.shopPageProduct.findMany({
          where: {
            id: { in: Array.from(new Set(paidOrderItems.map((item) => item.productId))) },
          },
          select: {
            id: true,
            category: true,
          },
        });

  const categoryByProductId = new Map(
    categoryProducts.map((product) => [product.id, product.category]),
  );

  // Process top categories
  const categoryRevenue: Record<string, number> = {};
  paidOrderItems.forEach((item) => {
    const category = categoryByProductId.get(item.productId) || "Unknown";
    categoryRevenue[category] = (categoryRevenue[category] || 0) + item.lineTotal;
  });

  const revenueByCategory = Object.entries(categoryRevenue)
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    dailyRevenue: [], // Simplified for now
    dailyOrders: [], // Simplified for now
    ordersByStatus,
    revenueByCategory,
  };
}

/**
 * Get enhanced analytics with AOV and daily breakdown
 */
export async function getEnhancedAnalytics(days: number = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Get all orders in period
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: startDate },
    },
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: { quantity: true },
      },
    },
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Build daily breakdown
  const dailyData: Record<string, { revenue: number; orders: number; date: string }> = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { revenue: 0, orders: 0, date: dateKey };
    }
    
    dailyData[dateKey].revenue += order.totalAmount;
    dailyData[dateKey].orders += 1;
  });

  const dailyBreakdown = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(day => ({
      date: day.date,
      revenue: day.revenue,
      orders: day.orders,
    }));

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    dailyBreakdown,
  };
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold?: number) {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: threshold || 10,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
      lowStockThreshold: true,
      images: true,
    },
    orderBy: { stock: "asc" },
    take: 20,
  });

  return products;
}

/**
 * Get funnel metrics (simplified conversion tracking)
 */
export async function getFunnelMetrics(days: number = 30) {
  const startDate = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);

  const [
    totalVisitors, // We'd normally get this from analytics, using users as proxy
    usersWithCart,
    completedOrders,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.cart.count({
      where: { createdAt: { gte: startDate }, status: { not: "ABANDONED" } },
    }),
    prisma.order.count({
      where: { paymentStatus: "PAID", createdAt: { gte: startDate } },
    }),
  ]);

  // Calculate conversion rates
  const cartConversionRate = totalVisitors > 0 ? (usersWithCart / totalVisitors) * 100 : 0;
  const checkoutConversionRate = usersWithCart > 0 ? (completedOrders / usersWithCart) * 100 : 0;
  const overallConversionRate = (completedOrders / totalVisitors) * 100;

  return {
    totalVisitors,
    usersWithCart,
    completedOrders,
    conversionRates: {
      cartConversion: parseFloat(cartConversionRate.toFixed(2)),
      checkoutConversion: parseFloat(checkoutConversionRate.toFixed(2)),
      overall: parseFloat(overallConversionRate.toFixed(2)),
    },
  };
}

/**
 * Get dynamic pricing suggestions based on sales data
 */
export async function getDynamicPricingSuggestions(productId?: string, category?: string, material?: string) {
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

  const paidOrderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        paymentStatus: "PAID",
        createdAt: { gte: thirtyDaysAgo },
      },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  const productIds = Array.from(new Set(paidOrderItems.map((item) => item.productId)));
  const products =
    productIds.length === 0
      ? []
      : await prisma.shopPageProduct.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            material: true,
            type: true,
          },
        });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const similarProducts = paidOrderItems
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      if (category && product.category !== category) {
        return null;
      }

      if (material && product.material !== material) {
        return null;
      }

      if (productId && product.id === productId) {
        return null;
      }

      return {
        ...item,
        product,
      };
    })
    .filter((item): item is {
      productId: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        category: string;
        material: string;
        type: string;
      };
    } => item !== null);

  if (similarProducts.length === 0) {
    return {
      suggestedPrice: null,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalSales: 0,
      confidence: "low",
    };
  }

  // Calculate pricing metrics
  const prices = similarProducts.map(item => item.product.price);
  const averagePrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalSales = similarProducts.reduce((sum, item) => sum + item.quantity, 0);

  // Suggest price based on average with some adjustment for demand
  const demandMultiplier = totalSales > 10 ? 1.1 : totalSales > 5 ? 1.05 : 0.95;
  const suggestedPrice = Math.round(averagePrice * demandMultiplier);

  const confidence = totalSales > 20 ? "high" : totalSales > 5 ? "medium" : "low";

  return {
    suggestedPrice,
    averagePrice,
    minPrice,
    maxPrice,
    totalSales,
    confidence,
  };
}

/**
 * Get demand prediction data for the last 7 days
 */
export async function getDemandPrediction(days: number = 7) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const rawPrisma = prisma as typeof prisma & {
    $queryRaw<T>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
  };

  // Get daily order counts
  const dailyOrders = await rawPrisma.$queryRaw<Array<{ date: Date; orders: bigint }>>`
    SELECT
      DATE(createdAt) as date,
      COUNT(*) as orders
    FROM \`Order\`
    WHERE paymentStatus = 'PAID'
      AND createdAt >= ${startDate}
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt)
  `;

  // Convert to numbers and calculate trends
  const data = dailyOrders.map((row, index) => {
    const orders = Number(row.orders);
    const previousOrders = index > 0 ? Number(dailyOrders[index - 1].orders) : orders;

    let trend: "up" | "down" | "stable" = "stable";
    let percentage = 0;

    if (previousOrders > 0) {
      percentage = ((orders - previousOrders) / previousOrders) * 100;
      if (percentage > 5) trend = "up";
      else if (percentage < -5) trend = "down";
    }

    return {
      date: row.date.toISOString().split('T')[0],
      orders,
      trend,
      percentage,
    };
  });

  return data;
}

/**
 * Get trending products based on recent sales growth
 */
export async function getTrendingProducts(days: number = 7) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

  // Get current period sales
  const currentSales = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      order: {
        paymentStatus: "PAID",
        createdAt: { gte: startDate },
      },
    },
  });

  // Get previous period sales
  const previousSales = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      order: {
        paymentStatus: "PAID",
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    },
  });

  // Calculate growth rates
  const salesMap = new Map();
  previousSales.forEach(item => {
    salesMap.set(item.productId, Number(item._sum?.quantity || 0));
  });

  const trending = currentSales
    .map(item => {
      const current = Number(item._sum?.quantity || 0);
      const previous = salesMap.get(item.productId) || 0;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

      return {
        productId: item.productId,
        currentSales: current,
        previousSales: previous,
        growth,
      };
    })
    .filter(item => item.growth > 20 && item.currentSales >= 3) // At least 20% growth and 3+ sales
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 10);

  // Get product details
  if (trending.length === 0) return [];

  const productIds = trending.map(t => t.productId);
  const products = await prisma.shopPageProduct.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
    },
  });

  return trending.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salesChange: item.growth,
      images: product.images,
    };
  }).filter((item): item is TrendingProduct => item !== null);
}

/**
 * Get products with significant sales drops
 */
export async function getSalesDropAlerts(days: number = 7) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

  // Get current period sales
  const currentSales = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      order: {
        paymentStatus: "PAID",
        createdAt: { gte: startDate },
      },
    },
  });

  // Get previous period sales
  const previousSales = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      order: {
        paymentStatus: "PAID",
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    },
  });

  // Calculate drop rates
  const salesMap = new Map();
  previousSales.forEach(item => {
    salesMap.set(item.productId, Number(item._sum?.quantity || 0));
  });

  const drops = currentSales
    .map(item => {
      const current = Number(item._sum?.quantity || 0);
      const previous = salesMap.get(item.productId) || 0;
      const drop = previous > 0 ? ((previous - current) / previous) * 100 : 0;

      return {
        productId: item.productId,
        currentSales: current,
        previousSales: previous,
        dropPercentage: drop,
      };
    })
    .filter(item => item.dropPercentage > 30 && item.previousSales >= 5) // At least 30% drop and 5+ previous sales
    .sort((a, b) => b.dropPercentage - a.dropPercentage)
    .slice(0, 10);

  // Get product details
  if (drops.length === 0) return [];

  const productIds = drops.map(d => d.productId);
  const products = await prisma.shopPageProduct.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
    },
  });

  return drops.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      productName: product?.name || "Unknown Product",
      productSlug: product?.slug || "",
      previousSales: item.previousSales,
      currentSales: item.currentSales,
      dropPercentage: item.dropPercentage,
      images: product?.images,
    };
  });
}
