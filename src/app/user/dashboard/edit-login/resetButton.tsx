"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

export default function ResetButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("This will reset the admin account to the seeded default credentials. Continue?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/reset", { method: "POST" });
      const text = await res.text();

      if (!res.ok) {
        console.error("Reset API returned:", res.status, text);
        toast.error("Reset failed. Please check the logs.");
        return;
      }

      toast.success("Admin credentials reset successfully.");
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Reset failed. Please check the logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleReset} disabled={loading}>
      {loading ? "Resetting..." : "Reset Admin Credentials"}
    </Button>
  );
}
