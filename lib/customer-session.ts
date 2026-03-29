import { getServerSession } from "next-auth";

import { customerAuthOptions } from "@/lib/customer-auth";
import { objectIdSchema } from "@/lib/validations/cart";

export async function getCurrentCustomerSession() {
  return getServerSession(customerAuthOptions);
}

export async function getCurrentCustomerUserId() {
  const session = await getCurrentCustomerSession();

  if (
    typeof session?.user?.id === "string" &&
    objectIdSchema.safeParse(session.user.id).success
  ) {
    return session.user.id;
  }

  return null;
}
