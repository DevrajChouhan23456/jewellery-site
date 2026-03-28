import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/customer-auth";

export async function getWishlist() {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id) return [];

  return prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });
}
