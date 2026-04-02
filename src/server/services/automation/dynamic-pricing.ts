import prisma from "@/lib/prisma";
import { createAlert } from "./alerts";
import { getAutomationSetting } from "./settings";
import { getDynamicPricingSuggestions } from "../admin/orders";

export async function applyDynamicPricing() {
  const isEnabled = await getAutomationSetting('dynamic_pricing_enabled');
  if (!isEnabled?.isEnabled) return;

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      material: true
    }
  });

  let updatedCount = 0;

  for (const product of products) {
    try {
      const suggestion = await getDynamicPricingSuggestions(
        product.id,
        product.category,
        product.material
      );

      if (suggestion.suggestedPrice && suggestion.confidence === 'high') {
        const priceChange = ((suggestion.suggestedPrice - product.price) / product.price) * 100;

        // Only apply significant changes (>5% or <-5%)
        if (Math.abs(priceChange) >= 5) {
          // Record price history
          await prisma.priceHistory.create({
            data: {
              productId: product.id,
              oldPrice: product.price,
              newPrice: suggestion.suggestedPrice,
              reason: 'dynamic_pricing',
              metadata: {
                confidence: suggestion.confidence,
                averagePrice: suggestion.averagePrice,
                totalSales: suggestion.totalSales,
                priceChangePercent: priceChange
              }
            }
          });

          // Update product price
          await prisma.product.update({
            where: { id: product.id },
            data: { price: suggestion.suggestedPrice }
          });

          updatedCount++;

          // Create alert for significant price changes
          if (Math.abs(priceChange) >= 10) {
            await createAlert({
              type: 'PRICE_CHANGE',
              title: 'Dynamic Price Update',
              message: `${product.name}: ₹${product.price} → ₹${suggestion.suggestedPrice} (${priceChange.toFixed(1)}%)`,
              priority: Math.abs(priceChange) >= 20 ? 'HIGH' : 'MEDIUM',
              metadata: {
                productId: product.id,
                productName: product.name,
                oldPrice: product.price,
                newPrice: suggestion.suggestedPrice,
                changePercent: priceChange,
                confidence: suggestion.confidence
              }
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error updating price for product ${product.id}:`, error);
    }
  }

  return updatedCount;
}

export async function getPriceHistory(productId: string, limit = 10) {
  return await prisma.priceHistory.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function getRecentPriceChanges(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await prisma.priceHistory.findMany({
    where: {
      createdAt: { gte: since },
      reason: 'dynamic_pricing'
    },
    include: {
      product: {
        select: { id: true, name: true, category: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}