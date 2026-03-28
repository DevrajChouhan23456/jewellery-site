import { getWishlist } from "@/lib/wishlist";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <div className="px-6 md:px-12 py-10">
      <h1 className="text-3xl font-semibold mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Your wishlist is empty 💔
        </div>
      ) : (
        <WishlistGrid items={items} />
      )}
    </div>
  );
}