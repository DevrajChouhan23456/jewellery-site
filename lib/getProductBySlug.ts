import { prisma } from "@/lib/prisma";

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  material: string;
  type: string;
  category: string;
  subCategory: string | null;
  createdAt: Date;
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    // Try Product first
    let product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        images: true,
        material: true,
        type: true,
        category: true,
        subCategory: true,
        createdAt: true,
      },
    });

    if (product) return product;

    // Try ShopPageProduct
    const shopProduct = await prisma.shopPageProduct.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        images: true,
        description: true,
        specifications: true,
        createdAt: true,
      },
    });

    if (shopProduct) {
      // Map to ProductDetail shape
      return {
        id: shopProduct.id,
        slug: shopProduct.slug,
        name: shopProduct.name,
        price: shopProduct.price,
        images: shopProduct.images,
        material: 'Gold', // Default
        type: 'Jewellery', // Default
        category: 'jewellery',
        subCategory: null,
        createdAt: shopProduct.createdAt,
      };
    }

    return null;
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return null;
  }
}

export async function getRelatedProducts(
  currentProduct: Pick<ProductDetail, "id" | "category" | "subCategory">,
  limit = 4,
): Promise<ProductDetail[]> {
  try {
    // Try personalized recommendations first
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recommendations?limit=${limit}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          // Filter out the current product and return personalized recommendations
          const personalized = data.recommendations
            .map((r: any) => r.product)
            .filter((p: any) => p.id !== currentProduct.id)
            .slice(0, limit);

          if (personalized.length >= limit * 0.5) { // If we have at least half personalized recommendations
            return personalized;
          }
        }
      }
    } catch (error) {
      console.warn('Personalized recommendations failed, falling back to category-based:', error);
    }

    // Fallback to category-based recommendations
    const bySubCategory = currentProduct.subCategory
      ? await prisma.product.findMany({
          where: {
            subCategory: currentProduct.subCategory,
            id: { not: currentProduct.id },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            images: true,
            material: true,
            type: true,
            category: true,
            subCategory: true,
            createdAt: true,
          },
          take: 10,
        })
      : [];

    const byCategory = await prisma.product.findMany({
      where: {
        category: currentProduct.category,
        id: { not: currentProduct.id },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        images: true,
        material: true,
        type: true,
        category: true,
        subCategory: true,
        createdAt: true,
      },
      take: 16,
    });

    const baseCandidates = bySubCategory.length ? bySubCategory : byCategory;
    const merged = [
      ...baseCandidates,
      ...byCategory.filter((p) => p.id !== currentProduct.id && !baseCandidates.some((b) => b.id === p.id)),
    ];

    return merged
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  } catch (error) {
    console.error('getRelatedProducts error:', error);
    return [];
  }
}