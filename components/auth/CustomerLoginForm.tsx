"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

import {
  DEFAULT_CUSTOMER_HOME_PATH,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";

type CustomerLoginFormProps = {
  callbackUrl?: string | null;
  description?: string;
  onSuccess?: () => void;
  title?: string;
};

export default function CustomerLoginForm({
  callbackUrl,
  description = "Continue with Google to save your wishlist, recover your bag, and finish checkout.",
  onSuccess,
  title = "Welcome back",
}: CustomerLoginFormProps) {
  const [error, setError] = useState("");
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const safeCallbackUrl = callbackUrl
    ? sanitizeCallbackUrl(callbackUrl, DEFAULT_CUSTOMER_HOME_PATH)
    : null;

  async function handleGoogleSignIn() {
    setError("");
    setIsGoogleSigningIn(true);

    try {
      const result = await signIn("google", {
        redirect: false,
        ...(safeCallbackUrl ? { callbackUrl: safeCallbackUrl } : {}),
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        onSuccess?.();
        window.location.assign(result.url);
        return;
      }

      throw new Error("We couldn't start Google sign-in right now.");
    } catch {
      const message =
        "Google sign-in is unavailable right now. Please try again in a moment.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGoogleSigningIn(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
        Sign in with Google, then review your bag, add delivery details, and pay
        securely.
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleSigningIn}
        className="w-full rounded-full border border-stone-300 bg-white py-3 font-medium text-stone-900 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGoogleSigningIn ? "Connecting to Google..." : "Continue with Google"}
      </button>
    </div>
  );
}
