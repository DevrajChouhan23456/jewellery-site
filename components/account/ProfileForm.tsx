"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ProfileFormProps = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export default function ProfileForm({ name, email, phone, address }: ProfileFormProps) {
  const [form, setForm] = useState({ name: name ?? "", phone: phone ?? "", address: address ?? "" });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (field: "name" | "phone" | "address") => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error ?? "Unable to update profile.");
      }

      setStatus("success");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          value={email ?? ""}
          readOnly
          disabled
          className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Address</span>
        <textarea
          value={form.address}
          onChange={handleChange("address")}
          rows={4}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" className="rounded-full" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Profile"}
        </Button>

        {status === "success" && <span className="text-sm font-medium text-emerald-700">Saved successfully</span>}
        {status === "error" && <span className="text-sm font-medium text-rose-700">{errorMessage}</span>}
      </div>
    </form>
  );
}
