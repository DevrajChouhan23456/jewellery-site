import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const product = await prisma.product.findFirst({
    where: { 
      slug,
      OR: [
        { category: { contains: slug, mode: 'insensitive' } },
        { type: { contains: slug, mode: 'insensitive' } },
      ]
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
  });

  if (!product) {
    notFound();
  }

  return product;
}

