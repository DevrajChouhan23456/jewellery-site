import { requireAdminPageAccess } from "@/server/auth/admin";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPageAccess("/admin/dashboard");

  return (
    <AdminPageShell>{children}</AdminPageShell>
  );
}
