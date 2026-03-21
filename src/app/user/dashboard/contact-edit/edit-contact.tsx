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
import { div } from "framer-motion/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function EditContactCard() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/contact/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, address }), // 👈 added address
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Something went wrong while updating contact.");
        return;
      }

      setSuccess("✅ Contact details updated successfully!");
    } catch (err) {
      console.error("❌ Frontend error:", err);
      setError("Network or server error. Try again later.");
    }
  }

  return (
    <div className="flex w-full justify-center">
      <div className="translate-y-5 mx-5 flex">
        <Link href="/user/dashboard">
          <ArrowLeft className="w-15 hover:scale-120" />
        </Link>
      </div>
      <Card className="p-0 max-w-sm w-full shadow-lg border-none rounded-2xl">
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          className="p-0 rounded-2xl"
        >
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b border-border p-4">
              <CardTitle>Edit Contact Details</CardTitle>
              <CardDescription>
                Update your phone, email, and address.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Street, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
            </CardContent>

            <CardFooter className="p-4 border-t border-border">
              <Button className="w-full" type="submit">
                Save Contact Info
              </Button>
            </CardFooter>
          </form>
        </MagicCard>
      </Card>
    </div>
  );
}
