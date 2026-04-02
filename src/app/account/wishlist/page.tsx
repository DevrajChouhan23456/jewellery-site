import { Suspense } from "react";
import { getWishlist } from "@/lib/wishlist";
import AccountSkeleton from "@/components/account/AccountSkeleton";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

export default async function AccountWishlistPage() {
  const items = await getWishlist();

  return (
    <Suspense fallback={<AccountSkeleton />}>
      <section className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
      <h1 className="mb-4 text-2xl font-semibold">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-amber-50 p-8 text-center text-slate-600">
          <h2 className="text-lg font-semibold">Wishlist is empty</h2>
          <p className="mt-2 text-sm">Save your favorite pieces and revisit them when you&apos;re ready.</p>
        </div>
      ) : (
        <WishlistGrid items={items} />
      )}
    </section>
  </Suspense>
  );
}
