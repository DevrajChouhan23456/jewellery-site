import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";

import { auth } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/50 bg-white/80 backdrop-blur-md">
        <div className="luxury-shell">
          <div className="flex items-center justify-between py-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-stone-950">Jewellery Admin</div>
                <div className="text-xs text-stone-500">Control Panel</div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard/edit-login"
                className="p-2 rounded-lg hover:bg-stone-100 transition"
                title="Settings"
              >
                <Settings className="size-5 text-stone-600" />
              </Link>
              <form action="/api/auth/signout" method="POST" className="inline">
                <button
                  type="submit"
                  className="p-2 rounded-lg hover:bg-stone-100 transition text-stone-600"
                  title="Sign out"
                >
                  <LogOut className="size-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
