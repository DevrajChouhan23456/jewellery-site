"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formattedSubtotal = new Intl.NumberFormat('en-IN').format(subtotal);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#faf9f6]">
          <h2 className="text-xl font-serif text-gray-900 tracking-wide flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Your Bag ({items.length})
          </h2>
          <button onClick={closeCart} className="p-2 text-gray-400 hover:text-gray-900 transition bg-white rounded-full shadow-sm hover:shadow">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <ShoppingBag className="size-16 text-gray-200 stroke-[1]" />
              <p className="font-serif text-lg">Your bag is empty.</p>
              <button onClick={closeCart} className="bg-[#832729] text-white px-6 py-2 rounded-full uppercase text-xs font-bold tracking-widest hover:bg-[#6a1f22] transition">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6 group">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#faf9f6] flex-shrink-0 border border-gray-100">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif text-sm text-gray-900 leading-snug line-clamp-2 pr-4">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-[#832729] transition self-start flex-shrink-0 mt-0.5">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="text-[#832729] font-medium font-serif mt-2 mb-auto">
                    ₹ {new Intl.NumberFormat('en-IN').format(item.price)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-50 w-max">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-[#faf9f6] p-6 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-gray-500 font-serif text-sm text-right align-bottom">Subtotal</span>
              <span className="text-2xl font-serif text-gray-900 leading-none">₹ {formattedSubtotal}</span>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-1 leading-relaxed">
              Taxes and shipping calculated at checkout.
            </p>
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="w-full flex justify-center items-center bg-[#832729] text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#6a1f22] hover:shadow-lg transition mt-4"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
