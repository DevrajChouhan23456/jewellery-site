"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

import {
  DEFAULT_CUSTOMER_HOME_PATH,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";
import { mergeCartAfterLogin } from "@/lib/mergeCart";

type CustomerLoginFormProps = {
  callbackUrl?: string | null;
  description?: string;
  onSuccess?: () => void;
  title?: string;
};

function createEmptyOtp() {
  return ["", "", "", "", "", ""];
}

export default function CustomerLoginForm({
  callbackUrl,
  description = "Sign in with your mobile number or Google account.",
  onSuccess,
  title = "Welcome back",
}: CustomerLoginFormProps) {
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpArray, setOtpArray] = useState(createEmptyOtp);
  const [timer, setTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const safeCallbackUrl = callbackUrl
    ? sanitizeCallbackUrl(callbackUrl, DEFAULT_CUSTOMER_HOME_PATH)
    : null;

  useEffect(() => {
    if (step !== "otp" || timer === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [step, timer]);

  async function handleSendOtp() {
    setError("");

    if (!phone || phone.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setIsSendingOtp(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "We couldn't send the OTP right now. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      if (typeof payload.normalizedPhone === "string") {
        setPhone(payload.normalizedPhone);
      }

      setOtpArray(createEmptyOtp());
      setStep("otp");
      setTimer(30);
      toast.success("OTP sent to your WhatsApp");
    } catch {
      const message = "We couldn't send the OTP right now. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    const finalOtp = otpArray.join("");

    if (finalOtp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    setError("");

    try {
      const result = await signIn("otp", {
        phone,
        otp: finalOtp,
        redirect: false,
        ...(safeCallbackUrl ? { callbackUrl: safeCallbackUrl } : {}),
      });

      if (result?.error) {
        setError("The OTP is incorrect or has expired. Please try again.");
        toast.error("Invalid OTP");
        return;
      }

      await mergeCartAfterLogin();
      toast.success("Welcome back");

      if (safeCallbackUrl) {
        window.location.assign(safeCallbackUrl);
        return;
      }

      onSuccess?.();
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", {
      ...(safeCallbackUrl ? { callbackUrl: safeCallbackUrl } : {}),
    });
  }

  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) {
      return;
    }

    setOtpArray((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !otpArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedValue)) {
      return;
    }

    const next = createEmptyOtp();

    pastedValue.split("").forEach((digit, index) => {
      next[index] = digit;
    });

    setOtpArray(next);
    inputsRef.current[Math.min(pastedValue.length, 6) - 1]?.focus();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>

      {step === "phone" ? (
        <>
          <input
            placeholder="Enter mobile number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border p-3 outline-none transition focus:ring-2 focus:ring-red-500"
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            className="w-full rounded-full bg-red-700 py-3 text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSendingOtp ? "Sending OTP..." : "Request OTP"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-full border py-3 transition hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </>
      ) : (
        <>
          <h3 className="text-sm font-medium text-stone-700">
            Enter OTP sent to {phone}
          </h3>

          <div className="flex gap-2">
            {otpArray.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(event.target.value, index)}
                onKeyDown={(event) => handleOtpKeyDown(event, index)}
                onPaste={handleOtpPaste}
                className="h-12 w-10 rounded-lg border text-center text-lg outline-none transition focus:ring-2 focus:ring-red-500"
              />
            ))}
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifyingOtp}
            className="w-full rounded-full bg-red-700 py-3 text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center text-sm text-gray-500">
            {timer === 0 ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="text-red-700"
              >
                {isSendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <span>Resend in {timer}s</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
