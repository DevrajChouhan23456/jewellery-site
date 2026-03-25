"use client";

import { useState } from "react";

export default function LoginModal({ isOpen, onClose }: any) {
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50">
      <div className="w-[800px] bg-white rounded-2xl overflow-hidden grid grid-cols-2 shadow-2xl">

        {/* LEFT DESIGN */}
        <div className="bg-[#f6e9dc] p-10 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl font-semibold text-[#7a4b2f]">
            Personalized Curations
          </h2>
          <p className="text-sm mt-3 text-[#8b6b5a]">
            Explore jewellery based on your taste
          </p>
        </div>

        {/* RIGHT FORM */}
        <div className="p-10 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-500"
          >
            ✕
          </button>

          {step === "phone" && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Welcome
              </h2>

              <input
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-lg mb-4"
              />

              <button
                onClick={async () => {
                  await fetch("/api/auth/send-otp", {
                    method: "POST",
                    body: JSON.stringify({ phone }),
                  });
                  setStep("otp");
                }}
                className="w-full bg-red-700 text-white py-3 rounded-full"
              >
                Request OTP
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Enter OTP
              </h2>

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border p-3 rounded-lg mb-4"
              />

              <button
                onClick={async () => {
                  const res = await fetch("/api/auth/verify-otp", {
                    method: "POST",
                    body: JSON.stringify({ phone, otp }),
                  });

                  const data = await res.json();

                  if (data.newUser) {
                    setStep("details");
                  } else {
                    onClose();
                  }
                }}
                className="w-full bg-black text-white py-3 rounded-full"
              >
                Verify
              </button>
            </>
          )}

          {step === "details" && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Complete Profile
              </h2>

              <input
                placeholder="Full Name"
                className="w-full border p-3 rounded-lg mb-3"
              />

              <input
                placeholder="Email"
                className="w-full border p-3 rounded-lg mb-4"
              />

              <button
                onClick={onClose}
                className="w-full bg-red-700 text-white py-3 rounded-full"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}