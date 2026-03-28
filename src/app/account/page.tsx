import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900">My Account</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
        Manage your sign-in, saved wishlist, and shopping bag from one place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/login"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">Login</h2>
          <p className="mt-2 text-sm text-stone-600">
            Sign in to sync your wishlist and cart.
          </p>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">Wishlist</h2>
          <p className="mt-2 text-sm text-stone-600">
            Review your saved pieces and move them into the cart.
          </p>
        </Link>
        <Link
          href="/cart"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#832729]"
        >
          <h2 className="text-lg font-semibold text-stone-900">Cart</h2>
          <p className="mt-2 text-sm text-stone-600">
            Continue shopping and finish checkout securely.
          </p>
        </Link>
      </div>
    </main>
  );
}
