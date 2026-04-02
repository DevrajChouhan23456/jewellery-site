import { ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (session) {
    redirect("/unauthorized");
  }

  return (
    <main
      className="relative isolate overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(180deg, #fffdf9 0%, #f6efe7 55%, #fffaf4 100%)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, rgba(214, 167, 92, 0.22), transparent 60%)",
        }}
      />
      <div className="luxury-shell grid min-h-screen items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <div className="luxury-panel p-8 luxury-shadow sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.26em] text-amber-900">
              <Sparkles className="size-3.5" />
              Private Admin Access
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Admin control room for the jewellery storefront.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              This sign-in is intentionally separated from the customer-facing
              website. Use it to manage branding, homepage storytelling, and
              secure dashboard operations.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5">
                <ShieldCheck className="size-5 text-[var(--luxury-gold-deep)]" />
                <p className="mt-3 text-sm font-medium text-stone-900">
                  Hidden from storefront navigation
                </p>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                  Customers use a separate account entry and never land in the CMS.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5">
                <Sparkles className="size-5 text-[var(--luxury-gold-deep)]" />
                <p className="mt-3 text-sm font-medium text-stone-900">
                  Role-protected dashboard
                </p>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                  Only the seeded admin account can enter the admin area.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <AdminLoginCard />
        </div>
      </div>
    </main>
  );
}
