import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Heart, LayoutDashboard, Package, Settings2, UserRound } from "lucide-react";

import { getCurrentCustomerSession } from "@/lib/customer-session";
import { MagicCard } from "@/components/ui/magicui/magic-card";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentCustomerSession();
  const user = session?.user;

  if (!user?.id) {
    redirect("/login");
  }

  const displayName = user.name || user.email || user.phone || "Member";
  const secondary = user.email || user.phone || "Verified member";
  const initial = displayName[0]?.toUpperCase() || "M";
  const userImage = (user as { image?: string } | undefined)?.image;

  return (
    <div className="min-h-screen bg-luxury-ivory text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <MagicCard
              className="rounded-2xl"
              gradientFrom="#832729"
              gradientTo="#FE8BBB"
              gradientOpacity={0.08}
              gradientSize={220}
            >
              <div className="rounded-2xl border border-sidebar-border bg-white/90 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/30">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-black/10">
                    {userImage ? (
                      <div
                        className="size-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${userImage}")` }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-linear-to-br from-[#832729]/20 to-[#832729]/5 text-sm font-semibold text-[#832729]">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{displayName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{secondary}</p>
                  </div>
                </div>

                <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">Account</h2>
                <nav className="space-y-1.5">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-white/10"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Package className="size-4" />
                    My Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Heart className="size-4" />
                    Wishlist
                  </Link>
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <UserRound className="size-4" />
                    Profile
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Settings2 className="size-4" />
                    Settings
                  </Link>
                </nav>
              </div>
            </MagicCard>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
