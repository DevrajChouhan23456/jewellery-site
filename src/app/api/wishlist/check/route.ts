import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/customer-auth";
import { z } from "zod";

const checkWishlistSchema = z.object({
  productId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid product id."),
});

export async function GET(req: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session) {
    return Response.json({ inWishlist: false });
  }

  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");

  if (!productId || !checkWishlistSchema.safeParse({ productId }).success) {
    return Response.json({ inWishlist: false });
  }

  try {
    const exists = await prisma.wishlist.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return Response.json({ inWishlist: !!exists });
  } catch {
    return Response.json({ inWishlist: false });
  }
}