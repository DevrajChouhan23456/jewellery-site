import Link from "next/link";
import { Heart, Package, Settings2, UserRound } from "lucide-react";

import { getCurrentCustomerSession } from "@/lib/customer-session";
import { MagicCard } from "@/components/ui/magicui/magic-card";

export default async function AccountPage() {
  const session = await getCurrentCustomerSession();
  const user = session?.user;

  const displayName = user?.name || user?.email || "Member";
  const secondary = user?.email || user?.phone || "Verified member";
  const initial = displayName[0]?.toUpperCase() || "M";
  const userImage = (user as { image?: string } | undefined)?.image;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <MagicCard
        className="rounded-2xl"
        gradientFrom="#832729"
        gradientTo="#FE8BBB"
        gradientOpacity={0.08}
        gradientSize={260}
      >
        <section className="rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative size-14 overflow-hidden rounded-full ring-1 ring-black/10">
                {userImage ? (
                  <div
                    className="size-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${userImage}")` }}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-[#832729]/20 to-[#832729]/5 text-lg font-semibold text-[#832729]">
                    {initial}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Welcome, {displayName}</h1>
                <p className="mt-1 text-sm text-stone-600">{secondary}</p>
              </div>
            </div>

            <Link
              href="/account/profile"
              className="inline-flex items-center justify-center rounded-lg border border-[#832729]/30 bg-[#832729]/5 px-4 py-2 text-sm font-medium text-[#832729] transition hover:bg-[#832729]/10"
            >
              Edit profile
            </Link>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
            Manage your profile, orders, wishlist, and preferences from one secure place.
          </p>
        </section>
      </MagicCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/account/orders"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]/60 hover:shadow-sm"
        >
          <Package className="size-5 text-[#832729]" />
          <h2 className="mt-3 text-base font-semibold text-stone-900">My Orders</h2>
          <p className="mt-1 text-sm text-stone-600">Track status and view details.</p>
        </Link>
        <Link
          href="/account/wishlist"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]/60 hover:shadow-sm"
        >
          <Heart className="size-5 text-[#832729]" />
          <h2 className="mt-3 text-base font-semibold text-stone-900">Wishlist</h2>
          <p className="mt-1 text-sm text-stone-600">Saved pieces for later.</p>
        </Link>
        <Link
          href="/account/profile"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]/60 hover:shadow-sm"
        >
          <UserRound className="size-5 text-[#832729]" />
          <h2 className="mt-3 text-base font-semibold text-stone-900">Profile</h2>
          <p className="mt-1 text-sm text-stone-600">Update your information securely.</p>
        </Link>
        <Link
          href="/account/settings"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]/60 hover:shadow-sm"
        >
          <Settings2 className="size-5 text-[#832729]" />
          <h2 className="mt-3 text-base font-semibold text-stone-900">Settings</h2>
          <p className="mt-1 text-sm text-stone-600">Privacy, notifications, and preferences.</p>
        </Link>
      </div>
    </main>
  );
}
