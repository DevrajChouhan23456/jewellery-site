import { ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import { auth } from "@/lib/auth";
import { isValidAdminSecret } from "@/lib/admin-gate";
import {
  DEFAULT_ADMIN_DASHBOARD_PATH,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";

type SecretAdminAccessPageProps = {
  params: Promise<{ secret: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SecretAdminAccessPage({
  params,
  searchParams,
}: SecretAdminAccessPageProps) {
  const [{ secret }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!isValidAdminSecret(secret)) {
    notFound();
  }

  const callbackUrl = sanitizeCallbackUrl(
    resolvedSearchParams.callbackUrl,
    DEFAULT_ADMIN_DASHBOARD_PATH,
  );
  const session = await auth();

  if (session?.user.role === "ADMIN") {
    redirect(callbackUrl);
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden px-6 py-16"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #fffdf9 0%, #f6efe7 55%, #fffaf4 100%)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, rgba(214, 167, 92, 0.22), transparent 60%)",
        }}
      />

      <div className="luxury-shell relative grid min-h-[calc(100vh-8rem)] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="luxury-panel p-8 luxury-shadow sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.26em] text-amber-900">
            <ShieldCheck className="size-3.5" />
            Hidden Admin Entry
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Secure admin access uses the same session system as the storefront.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
            This private gateway signs administrators into the same JWT-backed
            auth system used across the app, but only the ADMIN role can cross
            into protected dashboard routes and APIs.
          </p>
        </section>

        <div className="flex justify-center lg:justify-end">
          <AdminLoginCard
            callbackUrl={callbackUrl}
            title="Hidden admin access"
            description="Enter your administrator credentials to continue into the secured control room."
          />
        </div>
      </div>
    </main>
  );
}
