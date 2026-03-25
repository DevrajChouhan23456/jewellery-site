import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ProductWithCategory = Prisma.ShopPageProductGetPayload<{
  include: {
    shopPage: {
      select: { title: true; slug: true };
    };
  };
}>;

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
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
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}`);
    return null;
  }
}
