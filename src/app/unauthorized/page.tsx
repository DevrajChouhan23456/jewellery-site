import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
      <div className="luxury-panel max-w-xl px-8 py-12 text-center luxury-shadow">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--luxury-gold-deep)]">
          Restricted Access
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          This dashboard is available only to the site administrator.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--luxury-muted)] sm:text-base">
          If you are trying to manage the jewellery site, sign in with the
          configured admin account. Otherwise, return to the storefront.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
