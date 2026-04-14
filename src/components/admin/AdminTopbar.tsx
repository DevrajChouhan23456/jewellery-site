"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package2,
  Settings,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteIdentity } from "@/components/site-identity-provider";
import { cn } from "@/lib/utils";
import { studioPath } from "@/sanity/env";

const primaryLinks = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: Truck,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package2,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { siteIdentity } = useSiteIdentity();

  return (
    <header className="sticky top-0 z-40 px-3 pt-4 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/78 p-4 shadow-[0_20px_70px_-40px_rgba(41,26,13,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1c1917,#44403c_55%,#d6a75c)] text-white shadow-[0_20px_40px_-25px_rgba(214,167,92,0.9)]">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold tracking-tight text-stone-950">
                      {siteIdentity.shortName} Admin
                    </p>
                    <Badge className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900">
                      Secure Workspace
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500">
                    {siteIdentity.siteName} control center for catalog, orders, and growth.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-stone-300 bg-white/80 px-3"
                >
                  <Link href={studioPath}>
                    <Sparkles className="size-4" />
                    Studio
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-stone-300 bg-white/80 px-3"
                >
                  <Link href="/" target="_blank" rel="noreferrer">
                    <Store className="size-4" />
                    Storefront
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-stone-300 bg-white/80 px-3"
                >
                  <Link href="/admin/dashboard/logo">
                    <Sparkles className="size-4" />
                    Branding
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-stone-300 bg-white/80 px-3"
                >
                  <Link href="/admin/dashboard/edit-login">
                    <Settings className="size-4" />
                    Security
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 text-stone-700 hover:bg-stone-100"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {primaryLinks.map(({ href, icon: Icon, label }) => {
                const active = isActive(pathname, href);

                return (
                  <Button
                    key={href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-3.5",
                      active
                        ? "border border-stone-200 bg-stone-950 text-white hover:bg-stone-900"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-950",
                    )}
                  >
                    <Link href={href}>
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
