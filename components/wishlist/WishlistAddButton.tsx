"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type WishlistAddButtonProps = {
  productId: string;
  className?: string;
  label?: string;
};

export default function WishlistAddButton({
  productId,
  className,
  label = "Add to Wishlist",
}: WishlistAddButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleWishlist = async () => {
    if (!session) {
      router.push("/account/login");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to add item to wishlist.");
      }

      toast.success(data.message || "Added to wishlist.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add item to wishlist.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={saving}
      className={className ?? "inline-flex items-center gap-2 rounded-full border border-[#832729] px-4 py-2 text-sm font-medium text-[#832729] transition hover:bg-[#fcf8f8] disabled:opacity-60"}
    >
      <Heart className="size-4" />
      {saving ? "Saving..." : label}
    </button>
  );
}
