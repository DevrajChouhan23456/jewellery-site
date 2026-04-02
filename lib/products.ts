import { prisma } from "@/lib/prisma";
import { objectIdSchema } from "@/lib/validations/cart";
import type { Prisma } from "@prisma/client";

export type ProductWithCategory = Prisma.ShopPageProductGetPayload<{
  include: {
    shopPage: {
      select: { title: true; slug: true };
    };
  };
}>;

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  if (!objectIdSchema.safeParse(id).success) {
    return null;
  }

  try {
    const product = await prisma.shopPageProduct.findUnique({
      where: { id },
      include: {
        shopPage: {
          select: { title: true, slug: true },
        },
      },
    });
    return product;
  } catch {
    console.error(`Failed to fetch product with id ${id}`);
    return null;
  }
}

export type SearchProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    price: true;
    images: true;
    category: true;
    material: true;
    type: true;
    description: true;
    createdAt: true;
  };
}>;

export async function searchProducts(query: string, limit: number = 8): Promise<SearchProduct[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();

  try {
    // First, get products with their sales data
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { category: { contains: searchTerm, mode: "insensitive" } },
          { material: { contains: searchTerm, mode: "insensitive" } },
          { type: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true,
        material: true,
        type: true,
        description: true,
        createdAt: true,
      },
      take: limit * 2, // Get more to allow for ranking
    });

    // Get sales data separately
    const productIds = products.map(p => p.id);
    const salesData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds }
      },
      _count: {
        quantity: true,
      },
    });

    const salesMap = new Map(
      salesData.map(item => [item.productId, item._count.quantity])
    );

    // Calculate ranking scores
    const rankedProducts = products
      .map((product) => {
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const material = product.material.toLowerCase();
        const type = product.type.toLowerCase();
        const description = product.description?.toLowerCase() || "";

        // Exact match scoring
        let score = 0;
        if (name === searchTerm) score += 100; // Exact name match
        else if (name.includes(searchTerm)) score += 50; // Partial name match

        if (category === searchTerm) score += 80; // Exact category match
        else if (category.includes(searchTerm)) score += 40; // Partial category match

        if (material === searchTerm) score += 60; // Exact material match
        else if (material.includes(searchTerm)) score += 30; // Partial material match

        if (type === searchTerm) score += 60; // Exact type match
        else if (type.includes(searchTerm)) score += 30; // Partial type match

        if (description.includes(searchTerm)) score += 20; // Description match

        // Popularity bonus (sales count)
        const salesCount = salesMap.get(product.id) || 0;
        score += Math.min(salesCount * 5, 50); // Max 50 points from sales

        // Recency bonus (newer products get slight boost)
        const daysSinceCreated = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 30 - daysSinceCreated); // Products from last 30 days get bonus
        score += recencyScore;

        return {
          ...product,
          score,
          salesCount,
        };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit); // Take top results

    // Remove the score field before returning
    return rankedProducts.map(({ score, salesCount, ...product }) => product);
  } catch (error) {
    console.error("Search products error:", error);
    return [];
  }
}
