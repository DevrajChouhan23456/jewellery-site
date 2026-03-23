"use client";

import { useCartStore } from "@/lib/store";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ ...product });
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="flex-1 bg-[#832729] text-white px-8 py-4 rounded-full font-bold tracking-[0.2em] text-sm uppercase transition hover:bg-[#6a1f22] shadow-lg shadow-[#832729]/20 flex items-center justify-center"
    >
      Add to Cart
    </button>
  );
}
