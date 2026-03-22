"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/ui/magic-card";

function getFriendlyMessage(error: string) {
  if (
    error === "CredentialsSignin" ||
    error.toLowerCase().includes("credential")
  ) {
    return "The username or password is incorrect.";
  }

  if (error.toLowerCase().includes("configured")) {
    return "Admin credentials are not configured in the environment yet.";
  }

  return error;
}

export function MagicCardDemo() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl: searchParams.get("callbackUrl") ?? "/admin/dashboard",
      });

      if (res?.error) {
        setError(getFriendlyMessage(res.error));
        return;
      }

      setSuccessMessage("Login successful. Redirecting to the dashboard...");
      router.push(res?.url ?? "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/75 p-0 luxury-shadow backdrop-blur">
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        className="rounded-[2rem] p-0"
      >
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-stone-200 p-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-amber-900">
              <ShieldCheck className="size-3.5" />
              Admin Panel
            </div>
            <CardTitle className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
              Sign in
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the secured dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-7">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                name="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={!!error}
                required
                className="h-12 rounded-xl border-stone-200 bg-white/80"
              />
            </div>

            <div className="relative grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                required
                className="h-12 rounded-xl border-stone-200 bg-white/80 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error ? (
              <div
                id="error-message"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
          </CardContent>

          <CardFooter className="border-t border-stone-200 p-7">
            <Button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-stone-950 text-white hover:bg-stone-800"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </MagicCard>
    </Card>
  );
}
