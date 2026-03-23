import Link from "next/link";
import {
  ArrowRight,
  Crown,
  ImageIcon,
  Layers3,
  Palette,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Zap,
} from "lucide-react";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const quickActions = [
  {
    title: "Storefront Content",
    description: "Edit hero slides, homepage sections, and shop pages.",
    href: "/admin/dashboard/storefront",
    icon: ImageIcon,
    color: "from-blue-400 to-blue-600",
  },
  {
    title: "Brand Logo",
    description: "Update brand identity across the storefront.",
    href: "/admin/dashboard/logo",
    icon: Palette,
    color: "from-purple-400 to-purple-600",
  },
  {
    title: "Hero Slider",
    description: "Manage campaign images and hero section content.",
    href: "/admin/dashboard/slider-image",
    icon: Sparkles,
    color: "from-amber-400 to-amber-600",
  },
  {
    title: "Admin Settings",
    description: "Manage admin credentials and access control.",
    href: "/admin/dashboard/edit-login",
    icon: ShieldCheck,
    color: "from-red-400 to-red-600",
  },
];

const stats = [
  { label: "Hero Slides", key: "sliderCount" },
  { label: "Curated Items", key: "curatedCount" },
  { label: "Brand Assets", key: "logoCount" },
];

export default async function AdminDashboard() {
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

  const statsData = [
    { label: "Hero Slides", value: sliderCount, icon: ImageIcon },
    { label: "Curated Items", value: curatedCount, icon: Layers3 },
    { label: "Brand Assets", value: logoCount, icon: Palette },
  ];

  return (
    <div className="luxury-section luxury-shell">
      {/* Greeting Section */}
      <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 luxury-shadow sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              <Crown className="size-4" />
              Admin Panel
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Welcome back, {session?.user.username ?? "Admin"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              Manage storefronts, update brand identity, curate collections, and maintain security from a single dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/75 px-6 py-4 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Today</div>
            <div className="text-2xl font-bold text-stone-950">{today.split(" ").slice(0, 2).join(" ")}</div>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 luxury-shadow backdrop-blur hover:border-amber-200 transition"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-sm font-semibold text-stone-600 uppercase tracking-[0.1em]">
                  {stat.label}
                </p>
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                  <Icon className="size-4 text-amber-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-950">{stat.value}</div>
              <p className="mt-2 text-xs text-stone-500">Total in database</p>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-950">
            Quick Actions
          </h2>
          <p className="mt-2 text-sm text-[var(--luxury-muted)]">
            Access our most-used admin tools
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 luxury-shadow backdrop-blur transition hover:border-stone-300 hover:shadow-lg"
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 opacity-0 transition group-hover:opacity-5 bg-gradient-to-br ${action.color}`}
                />

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${action.color} mb-4`}>
                    <Icon className="size-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-stone-950 group-hover:text-amber-700 transition">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--luxury-muted)] leading-relaxed">
                    {action.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-stone-600 group-hover:text-stone-950 transition">
                    Go to section
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
