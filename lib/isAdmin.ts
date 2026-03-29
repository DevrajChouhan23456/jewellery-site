import { getAdminSession } from "@/lib/admin/access";

export async function isAdmin() {
  return Boolean(await getAdminSession());
}
