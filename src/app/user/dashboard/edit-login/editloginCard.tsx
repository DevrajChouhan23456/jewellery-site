"use client";

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
import { MagicCard } from "@/components/magicui/magic-card";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditLoginCard() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newUsername && !newPassword) {
      setError("Enter at least a new username or password to update.");
      return;
    }

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

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    } else {
      router.push("/user/dashboard");
    }
  }

  return (
    <Card className="p-0 max-w-sm w-full shadow-lg border-none rounded-2xl">
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        className="p-0 rounded-2xl"
      >
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-border p-4">
            <CardTitle>Update Login Details</CardTitle>
            <CardDescription>
              Change your username, password, or both.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-6">
            {/* Current Credentials */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentUsername">Current Username</Label>
                <Input
                  id="currentUsername"
                  type="text"
                  placeholder="your_current_username"
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
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* New Credentials */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="newUsername">New Username (optional)</Label>
                <Input
                  id="newUsername"
                  type="text"
                  placeholder="new_username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password (optional)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="p-4 border-t border-border">
            <Button className="w-full" type="submit">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </MagicCard>
    </Card>
  );
}
