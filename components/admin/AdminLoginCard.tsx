"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import {
  DEFAULT_ADMIN_DASHBOARD_PATH,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginCardProps = {
  callbackUrl?: string;
  description?: string;
  onSuccess?: () => void;
  title?: string;
};

export function AdminLoginCard({
  callbackUrl = DEFAULT_ADMIN_DASHBOARD_PATH,
  description = "Enter your admin credentials",
  onSuccess,
  title = "Admin Login",
}: AdminLoginCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const safeCallbackUrl = sanitizeCallbackUrl(
    callbackUrl,
    DEFAULT_ADMIN_DASHBOARD_PATH,
  );
  const authErrorMessage =
    {
      TWO_FACTOR_REQUIRED: "Enter your 6-digit authenticator code.",
      INVALID_TWO_FACTOR_CODE: "The authenticator code is invalid or expired.",
      TWO_FACTOR_CONFIGURATION_ERROR:
        "Admin 2FA is misconfigured. Disable and re-enable 2FA from an active admin session.",
      CredentialsSignin: "Invalid credentials.",
    } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        twoFactorCode,
        redirect: false,
        callbackUrl: safeCallbackUrl,
      });

      if (result?.error) {
        toast.error(
          authErrorMessage[
            result.error as keyof typeof authErrorMessage
          ] ?? "Login failed.",
        );
      } else if (result?.ok) {
        toast.success("Login successful");
        onSuccess?.();
        window.location.assign(safeCallbackUrl);
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="luxury-panel w-full max-w-md p-8 luxury-shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-stone-950">{title}</h2>
        <p className="text-stone-600 mt-2">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="two-factor-code">Authenticator Code</Label>
          <Input
            id="two-factor-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Only required if admin 2FA is enabled"
            className="mt-1"
          />
          <p className="mt-2 text-xs text-stone-500">
            Enter the 6-digit code from your authenticator app if you have admin
            2FA enabled.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
