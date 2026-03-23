import prisma from "@/lib/prisma";

/**
 * Fetch product prices in a single query for given product ids.
 */
export async function fetchProductPrices(productIds: string[]) {
  if (productIds.length === 0) return [];
  const uniques = Array.from(new Set(productIds));
  const products = await prisma.shopPageProduct.findMany({
    where: { id: { in: uniques } },
    select: { id: true, price: true },
  });
  const priceMap = new Map(products.map((p) => [p.id, p.price]));
  return productIds.map((id) => priceMap.get(id) ?? null);
}
