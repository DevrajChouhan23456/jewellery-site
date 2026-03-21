// src/app/user/dashboard/edit-login/resetButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ResetButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("This will reset sample data. Continue?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/reset", { method: "POST" });
      const text = await res.text(); // helpful for debugging
      if (!res.ok) {
        console.error("Reset API returned:", res.status, text);
        toast.error("Reset failed. See console.");
        return;
      }
      toast.success("System reset successful ✅");
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Reset failed. Check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleReset} disabled={loading}>
      {loading ? "Resetting..." : "Reset System"}
    </Button>
  );
}
