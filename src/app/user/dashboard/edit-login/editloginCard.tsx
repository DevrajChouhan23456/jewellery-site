"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

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

export function EditLoginCard() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUsername && !newPassword) {
      setError("Enter at least a new username or password to update.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername,
          currentPassword,
          newUsername: newUsername || null,
          newPassword: newPassword || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess("Admin credentials updated successfully.");
      router.refresh();
      router.push("/admin/dashboard");
    } catch {
      setError("Unable to update credentials right now.");
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
          <CardHeader className="border-b border-stone-200 p-5">
            <CardTitle>Update Admin Credentials</CardTitle>
            <CardDescription>
              Change the dashboard username, password, or both.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-5">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentUsername">Current Username</Label>
                <Input
                  id="currentUsername"
                  type="text"
                  placeholder="Current admin username"
                  value={currentUsername}
                  onChange={(e) => setCurrentUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Current admin password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="newUsername">New Username</Label>
                <Input
                  id="newUsername"
                  type="text"
                  placeholder="Optional new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Optional new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
          </CardContent>

          <CardFooter className="border-t border-stone-200 p-5">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Admin Changes"}
            </Button>
          </CardFooter>
        </form>
      </MagicCard>
    </Card>
  );
}
