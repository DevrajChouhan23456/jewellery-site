import Link from "next/link";
import { ArrowRight, Heart, MapPin, Package, ShieldCheck } from "lucide-react";

const accountFeatures = [
  {
    title: "Orders",
    description: "Track recent purchases, delivery updates, and invoices.",
    icon: Package,
  },
  {
    title: "Wishlist",
    description: "Save favourite rings, earrings, and gifting picks.",
    icon: Heart,
  },
  {
    title: "Addresses",
    description: "Manage saved delivery details and visit preferences.",
    icon: MapPin,
  },
];

export default function AccountPage() {
  return (
    <main className="luxury-shell luxury-section">
      <section className="luxury-panel overflow-hidden p-8 luxury-shadow sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              Customer Account
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              A separate space for your orders, saved pieces, and personal details.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              We&apos;ve separated the customer account area from the admin CMS so
              shoppers and store managers have distinct experiences. Customer
              sign-in is the next feature to complete.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/account/login"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Continue to Customer Login
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Back to Storefront
              </Link>
            </div>
          </div>

          <div
            className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-stone-100"
            style={{ boxShadow: "0 30px 90px -55px rgba(28, 25, 23, 0.92)" }}
          >
            <ShieldCheck className="size-5 text-amber-300" />
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Separate from admin access
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Admin sign-in now lives under `/admin`, while customer account
              routes stay public-facing and ready for a dedicated user auth flow.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {accountFeatures.map((feature) => (
          <div
            key={feature.title}
            className="luxury-panel rounded-[1.75rem] p-7 luxury-shadow"
          >
            <feature.icon className="size-5 text-[var(--luxury-gold-deep)]" />
            <h2 className="mt-4 text-lg font-semibold text-stone-950">
              {feature.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
              {feature.description}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
