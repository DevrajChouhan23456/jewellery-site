import { getServerSession } from "next-auth";

import { customerAuthOptions } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wishlistId } = await req.json();

  if (typeof wishlistId !== "string" || !wishlistId) {
    return Response.json({ error: "Wishlist item id is required" }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: {
      id: wishlistId,
      userId: session.user.id,
    },
  });

  return Response.json({ ok: true });
}
