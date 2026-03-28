"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

import { mergeCartAfterLogin } from "@/lib/mergeCart";

export default function LoginModal({ isOpen, onClose }: any) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const finalOtp = otpArray.join("");

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  if (!isOpen) return null;

  // ⏱️ TIMER
  function startTimer() {
    setTimer(30);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // 📱 SEND OTP
  const handleSendOtp = async () => {
    setError("");

    if (!phone || phone.length < 10) {
      setError("Enter valid phone number");
      return;
    }

    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      toast.success("OTP sent 📩");
      startTimer();
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  // 🔐 VERIFY OTP (ONLY NEXTAUTH)
  const handleVerify = async () => {
    setLoading(true);
    setError("");

    if (finalOtp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      phone,
      otp: finalOtp,
      redirect: false,
    });

    if (!res?.error) {
      await mergeCartAfterLogin(); // 🔥 IMPORTANT
    }
    if (res?.error) {
      setError("Invalid or expired OTP");
      toast.error("Invalid OTP ❌");
      setLoading(false);
      return;
    }

    toast.success("Welcome 🎉");

    setTimeout(() => {
      onClose();
    }, 800);

    setLoading(false);
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    await handleSendOtp();
  };

  // 🔢 INPUT CHANGE
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ⬅️ BACKSPACE UX
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // 📋 PASTE SUPPORT
  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtpArray(newOtp);

    inputsRef.current[5]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50">
      <div className="w-[800px] bg-white rounded-2xl overflow-hidden grid grid-cols-2 shadow-2xl animate-in fade-in zoom-in">
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
            className="absolute right-5 top-5 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          {/* PHONE STEP */}
          {step === "phone" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Welcome</h2>

              <input
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-red-500"
              />

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <button
                onClick={handleSendOtp}
                className="w-full bg-red-700 hover:bg-red-800 transition text-white py-3 rounded-full"
              >
                Request OTP
              </button>

              {/* GOOGLE LOGIN */}
              <button
                onClick={() => signIn("google")}
                className="w-full border py-3 rounded-full mt-3 hover:bg-gray-50"
              >
                Continue with Google
              </button>
            </>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Enter OTP sent to {phone}
              </h2>

              <div className="flex gap-2 mb-4">
                {otpArray.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-10 h-12 text-center border rounded-lg text-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <button
                onClick={handleVerify}
                className="w-full bg-red-700 hover:bg-red-800 transition text-white py-3 rounded-full"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-sm text-gray-500 mt-3 text-center">
                {canResend ? (
                  <button onClick={handleResend} className="text-red-700">
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in {timer}s</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
