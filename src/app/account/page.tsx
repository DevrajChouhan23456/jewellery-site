import Link from "next/link";

import { getCurrentCustomerSession } from "@/lib/customer-session";

export default async function AccountPage() {
  const session = await getCurrentCustomerSession();
  const user = session?.user;

  const displayName = user?.name || user?.email || "Member";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900">Welcome, {displayName}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
        Manage your profile, orders, and wishlist from one secure place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">My Orders</h2>
          <p className="mt-2 text-sm text-stone-600">Track status and view details.</p>
        </Link>
        <Link
          href="/account/wishlist"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">Wishlist</h2>
          <p className="mt-2 text-sm text-stone-600">Saved pieces for later.</p>
        </Link>
        <Link
          href="/account/profile"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">Profile</h2>
          <p className="mt-2 text-sm text-stone-600">Update your information securely.</p>
        </Link>
      </div>
    </main>
  );
}
