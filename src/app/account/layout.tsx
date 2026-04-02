import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentCustomerSession } from "@/lib/customer-session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentCustomerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-luxury-ivory text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-sidebar-border bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/30">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Account</h2>
            <nav className="space-y-2">
              <Link
                href="/account"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                href="/account/orders"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                My Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Wishlist
              </Link>
              <Link
                href="/account/profile"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Profile
              </Link>
            </nav>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
