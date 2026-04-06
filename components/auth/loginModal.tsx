"use client";

import CustomerLoginForm from "@/components/auth/CustomerLoginForm";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
      <div className="grid w-[800px] grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in">
        <div className="flex flex-col items-center justify-center bg-[#f6e9dc] p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#7a4b2f]">
            Personalized Curations
          </h2>
          <p className="mt-3 text-sm text-[#8b6b5a]">
            Explore jewellery based on your taste.
          </p>
        </div>

        <div className="relative p-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-500 hover:text-black"
          >
            x
          </button>

          <CustomerLoginForm
            onSuccess={onClose}
            title="Welcome"
            description="Sign in to save your wishlist, recover your cart, and continue shopping."
          />
        </div>
      </div>
    </div>
  );
}
