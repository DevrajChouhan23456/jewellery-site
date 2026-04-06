import { redirect } from "next/navigation";

import { buildAdminAccessPath } from "@/lib/admin-gate";
import { DEFAULT_ADMIN_DASHBOARD_PATH } from "@/lib/auth-routes";

export default function AdminLoginPage() {
  redirect(buildAdminAccessPath(DEFAULT_ADMIN_DASHBOARD_PATH));
}
