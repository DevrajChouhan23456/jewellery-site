import { getServerSession } from "next-auth";
import { z } from "zod";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { customerAuthOptions } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const removeWishlistSchema = z.object({
  wishlistId: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Wishlist item id is required"),
});

export async function POST(req: Request) {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(req, removeWishlistSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Wishlist item id is required"),
      },
      { status: 400 },
    );
  }

  const { wishlistId } = parsedBody.data;

  await prisma.wishlist.deleteMany({
    where: {
      id: wishlistId,
      userId: session.user.id,
    },
  });

  return Response.json({ ok: true });
}
