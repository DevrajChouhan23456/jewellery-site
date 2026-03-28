import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/customer-auth";

export async function POST(req: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  const exists = await prisma.wishlist.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  if (exists) {
    return Response.json({ message: "Already in wishlist" });
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      productId,
    },
  });

  return Response.json(item);
}
