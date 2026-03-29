import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/customer-auth";
import { z } from "zod";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";

const addWishlistSchema = z.object({
  productId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid product id."),
});

export async function POST(req: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(req, addWishlistSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Invalid wishlist request."),
      },
      { status: 400 },
    );
  }

  const { productId } = parsedBody.data;

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
