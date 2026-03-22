import Link from "next/link";
import {
  ArrowRight,
  Crown,
  ImageIcon,
  Layers3,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const quickActions = [
  {
    title: "Update Brand Logo",
    description: "Refresh storefront branding and keep the header identity sharp.",
    href: "/admin/dashboard/logo",
    icon: Palette,
  },
  {
    title: "Manage Hero Slider",
    description: "Upload polished campaign visuals for the homepage spotlight.",
    href: "/admin/dashboard/storefront",
    icon: ImageIcon,
  },
  {
    title: "Review Curated Collections",
    description: "Track homepage collection groups and merchandising highlights.",
    href: "/admin/dashboard/storefront",
    icon: Layers3,
  },
  {
    title: "Admin Login Settings",
    description: "Rotate credentials and keep dashboard access secure.",
    href: "/admin/dashboard/edit-login",
    icon: ShieldCheck,
  },
];

export default async function Dashboard() {
  const session = await auth();

  const [logoCount, curatedCount, sliderCount, latestLogo, latestSlider] =
    await Promise.all([
      prisma.logo.count(),
      prisma.curatedItem.count(),
      prisma.slider.count(),
      prisma.logo.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.slider.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="luxury-shell luxury-section">
      <section
        className="overflow-hidden rounded-[2rem] border border-white/70 p-8 luxury-shadow sm:p-10"
        style={{
          backgroundImage: "linear-gradient(135deg, #fff9f2 0%, #f3e6d7 100%)",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              <Crown className="size-3.5" />
              Jewellery Admin
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Welcome back, {session?.user.username ?? "Admin"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              Manage the visual identity of the jewellery storefront, curate the
              homepage experience, and keep admin access secure from one control
              room.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/75 px-5 py-4 text-sm text-stone-700">
            <div className="font-medium text-stone-950">Today</div>
            <div className="mt-1">{today}</div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="luxury-panel p-6 luxury-shadow">
          <p className="text-sm font-medium text-stone-500">Brand Assets</p>
          <div className="mt-4 text-3xl font-semibold text-stone-950">
            {logoCount}
          </div>
          <p className="mt-2 text-sm text-[var(--luxury-muted)]">
            Active logo record{logoCount === 1 ? "" : "s"} in the database.
          </p>
        </div>
        <div className="luxury-panel p-6 luxury-shadow">
          <p className="text-sm font-medium text-stone-500">Curated Sections</p>
          <div className="mt-4 text-3xl font-semibold text-stone-950">
            {curatedCount}
          </div>
          <p className="mt-2 text-sm text-[var(--luxury-muted)]">
            Homepage category highlights ready for merchandising.
          </p>
        </div>
        <div className="luxury-panel p-6 luxury-shadow">
          <p className="text-sm font-medium text-stone-500">Hero Slides</p>
          <div className="mt-4 text-3xl font-semibold text-stone-950">
            {sliderCount}
          </div>
          <p className="mt-2 text-sm text-[var(--luxury-muted)]">
            Campaign visuals powering the landing hero.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="luxury-panel p-8 luxury-shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
                Quick Actions
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-950">
                Jewellery-site operations
              </h2>
            </div>
            <Sparkles className="size-5 text-[var(--luxury-gold-deep)]" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[1.5rem] border border-stone-200 bg-white/90 p-5 transition hover:-translate-y-1 hover:border-amber-200"
              >
                <item.icon className="size-5 text-[var(--luxury-gold-deep)]" />
                <h3 className="mt-4 text-lg font-semibold text-stone-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                  Open
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="luxury-panel p-8 luxury-shadow">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              Storefront Snapshot
            </p>
            <div className="mt-5 space-y-4 text-sm text-stone-700">
              <div className="rounded-[1.25rem] border border-stone-200 bg-white/80 p-4">
                <div className="font-medium text-stone-950">Latest logo asset</div>
                <div className="mt-1 text-[var(--luxury-muted)]">
                  {latestLogo ? latestLogo.imageUrl : "No logo uploaded yet."}
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-stone-200 bg-white/80 p-4">
                <div className="font-medium text-stone-950">Latest hero slide</div>
                <div className="mt-1 text-[var(--luxury-muted)]">
                  {latestSlider ? latestSlider.imageUrl : "No slider image uploaded yet."}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-stone-100"
            style={{ boxShadow: "0 30px 90px -55px rgba(28, 25, 23, 0.92)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Admin Security
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Database-backed admin credentials are now the source of truth.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Use the login settings page to rotate credentials after the first
              seeded sign-in and keep the dashboard private to your admin team.
            </p>
            <Link
              href="/admin/dashboard/edit-login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
            >
              Open Admin Settings
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
