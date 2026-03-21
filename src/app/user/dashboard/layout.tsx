// app/user/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/user/login");

  // if (session.user.role !== "ADMIN") redirect("/unauthorized");

  return (
    <div className="min-h-screen">
      {/* Common Navbar / Sidebar */}
      <main>{children}</main>
    </div>
  );
}
