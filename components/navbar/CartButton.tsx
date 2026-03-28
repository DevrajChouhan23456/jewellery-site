"use client";

import { ShoppingBag } from "lucide-react";

type CartButtonProps = {
  count: number;
  showCount: boolean;
  onClick: () => void;
};

const CartButton = ({ count, showCount, onClick }: CartButtonProps) => (
  <button
    onClick={onClick}
    className="flex relative items-center justify-center hover:opacity-80 transition mt-[-4px]"
  >
    <ShoppingBag className="size-5 stroke-[1.5]" />
    {showCount && count > 0 ? (
      <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#832729] text-[10px] font-bold text-white">
        {count}
      </span>
    ) : null}
  </button>
);

export default CartButton;
