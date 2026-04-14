import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import CustomerLoginForm from "@/components/auth/CustomerLoginForm";
import { auth } from "@/lib/auth";
import {
  DEFAULT_ADMIN_DASHBOARD_PATH,
  DEFAULT_CUSTOMER_HOME_PATH,
  sanitizeCallbackUrl,
} from "@/lib/auth-routes";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    mode?: string;
  }>;
};

export default async function CustomerLoginPage({
  searchParams,
}: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const isAdminMode = resolvedSearchParams.mode === "admin";
  const callbackUrl = sanitizeCallbackUrl(
    resolvedSearchParams.callbackUrl,
    isAdminMode ? DEFAULT_ADMIN_DASHBOARD_PATH : DEFAULT_CUSTOMER_HOME_PATH,
  );
  const session = await auth();

  if (session?.user.role === "ADMIN") {
    redirect(isAdminMode ? callbackUrl : DEFAULT_ADMIN_DASHBOARD_PATH);
  }

  if (session && !isAdminMode) {
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

      <div className="luxury-shell relative grid min-h-[calc(100vh-8rem)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="luxury-panel p-8 luxury-shadow sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.26em] text-amber-900">
            <ShieldCheck className="size-3.5" />
            Unified Secure Access
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            {isAdminMode
              ? "One sign-in system now protects both storefront and admin access."
              : "Continue with Google and move from bag to payment without friction."}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
            {isAdminMode
              ? "Customers and administrators now share the same NextAuth session pipeline, with the role inside the JWT deciding whether protected dashboard routes and APIs stay locked or open."
              : "Customer sign-in now stays focused on a single Google flow, so wishlist recovery, bag sync, checkout, and payment all happen from one simple session."}
          </p>
        </section>

        <div className="grid gap-6">
          {isAdminMode ? (
            <AdminLoginCard
              callbackUrl={callbackUrl}
              title="Admin access"
              description="Use administrator credentials to enter the protected dashboard."
            />
          ) : null}

          <div className="luxury-panel p-8 luxury-shadow">
            <CustomerLoginForm
              callbackUrl={
                isAdminMode ? DEFAULT_CUSTOMER_HOME_PATH : callbackUrl
              }
              title={isAdminMode ? "Customer sign in" : "Welcome back"}
              description={
                isAdminMode
                  ? "Customers now use Google sign-in here, while non-admin accounts still stay blocked from dashboard routes."
                  : "Continue with Google to shop, buy, and pay with one customer session."
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
