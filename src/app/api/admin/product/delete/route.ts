import { isAdmin } from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await isAdmin();

  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await req.json()) as { id: string };

  await prisma.product.delete({
    where: { id },
  });

  return Response.json({ success: true });
}
