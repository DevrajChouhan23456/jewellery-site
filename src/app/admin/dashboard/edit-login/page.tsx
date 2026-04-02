import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";

export default async function EditLoginPage() {
  await requireAdminPageAccess("/admin/dashboard/edit-login");

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-stone-950">Edit Login</h1>
          <p className="text-stone-600">Manage admin login settings</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
        <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
          <h2 className="text-xl font-semibold text-stone-950">Admin Login Settings</h2>
          <p className="mt-1 text-sm text-[var(--luxury-muted)]">
            Configure admin authentication settings
          </p>
        </div>
        <div className="px-6 py-8 sm:px-8">
          <p className="text-stone-600">This feature is under development.</p>
        </div>
      </section>
    </main>
  );
}
