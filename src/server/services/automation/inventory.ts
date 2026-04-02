import prisma from "@/lib/prisma";
import { createAlert } from "./alerts";
import { getAutomationSetting } from "./settings";

export async function checkLowStockProducts() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.product.fields.lowStockThreshold
      }
    },
    select: {
      id: true,
      name: true,
      stock: true,
      lowStockThreshold: true,
      category: true
    }
  });

  return lowStockProducts;
}

export async function sendLowStockAlerts() {
  const isEnabled = await getAutomationSetting('inventory_alerts_enabled');
  if (!isEnabled?.isEnabled) return;

  const lowStockProducts = await checkLowStockProducts();

  if (lowStockProducts.length === 0) return;

  // Group by category for better alerts
  const alertsByCategory = lowStockProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof lowStockProducts>);

  // Create alerts for each category
  for (const [category, products] of Object.entries(alertsByCategory)) {
    const productNames = products.map(p => `${p.name} (${p.stock}/${p.lowStockThreshold})`).join(', ');

    await createAlert({
      type: 'INVENTORY_LOW',
      title: `Low Stock Alert: ${category}`,
      message: `Products running low: ${productNames}`,
      priority: products.some(p => p.stock === 0) ? 'HIGH' : 'MEDIUM',
      metadata: {
        category,
        products: products.map(p => ({ id: p.id, name: p.name, stock: p.stock, threshold: p.lowStockThreshold }))
      }
    });
  }

  return lowStockProducts;
}

export async function getInventoryReport() {
  const totalProducts = await prisma.product.count();

  const lowStockCount = await prisma.product.count({
    where: {
      stock: {
        lte: prisma.product.fields.lowStockThreshold
      }
    }
  });

  const outOfStockCount = await prisma.product.count({
    where: { stock: 0 }
  });

  const totalValue = await prisma.product.aggregate({
    _sum: {
      stock: true
    }
  });

  return {
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalStockValue: totalValue._sum.stock || 0
  };
}