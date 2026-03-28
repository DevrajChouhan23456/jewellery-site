import { isAdmin } from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await isAdmin();

  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...data } = (await req.json()) as {
    id: string;
    name?: string;
    slug?: string;
    price?: number;
    category?: string;
    subCategory?: string | null;
    material?: string;
    type?: string;
    images?: string[];
  };

  await prisma.product.update({
    where: { id },
    data,
  });

  return Response.json({ success: true });
}
