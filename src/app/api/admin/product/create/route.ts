import { randomUUID } from "node:crypto";

import { isAdmin } from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await isAdmin();

  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    name?: string;
    slug?: string;
    price?: number;
    category?: string;
    subCategory?: string | null;
    material?: string;
    type?: string;
    images?: string[];
  };

  const product = await prisma.product.create({
    data: {
      name: body.name ?? "Untitled Product",
      slug: body.slug ?? randomUUID(),
      price: typeof body.price === "number" ? body.price : 0,
      category: body.category ?? "jewellery",
      subCategory: body.subCategory ?? null,
      material: body.material ?? "gold",
      type: body.type ?? "ring",
      images: Array.isArray(body.images) ? body.images : [],
    },
  });

  return Response.json(product);
}
