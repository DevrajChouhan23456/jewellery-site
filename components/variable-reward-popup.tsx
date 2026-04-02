"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";

interface VariableRewardPopupProps {
  isVisible: boolean;
  onClose: () => void;
  discount: number;
}

export function VariableRewardPopup({ isVisible, onClose, discount }: VariableRewardPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl max-w-sm mx-4 text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="mb-4"
            >
              <Sparkles className="size-12 mx-auto" />
            </motion.div>

            <h3 className="text-2xl font-bold mb-2">🎉 Special Offer!</h3>
            <p className="text-lg mb-4">
              Get <span className="font-bold text-3xl">{discount}%</span> off your next purchase!
            </p>
            <p className="text-sm opacity-90 mb-6">
              This exclusive discount is only available for the next 24 hours.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Claim Discount
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage variable rewards
export function useVariableRewards() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(0);

  useEffect(() => {
    // Show popup randomly (1 in 20 chance) when component mounts
    const shouldShow = Math.random() < 0.05; // 5% chance
    if (shouldShow) {
      const discount = Math.floor(Math.random() * 30) + 10; // 10-40% discount
      setCurrentDiscount(discount);
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  return {
    showPopup,
    currentDiscount,
    closePopup,
  };
}