"use client";

import type { ComponentType } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";

interface AnalyticsCardsProps {
  revenue: number;
  orders: number;
  users: number;
  averageOrderValue: number;
  revenueChange?: number;
  ordersChange?: number;
  usersChange?: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: amount > 100000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function StatCard({
  label,
  value,
  helper,
  change,
  accent,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string;
  helper: string;
  change?: number;
  accent: string;
  icon: ComponentType<{ className?: string }>;
  delay: number;
}) {
  const positive = typeof change === "number" ? change >= 0 : null;
  const changeValue = change ?? 0;

  return (
    <BlurFade inView delay={delay}>
      <MagicCard
        className="h-full rounded-[1.75rem] border border-white/75 bg-white/86 shadow-[0_22px_60px_-46px_rgba(28,25,23,0.42)]"
        gradientFrom="#d6a75c"
        gradientTo="#67e8f9"
        gradientColor="rgba(28,25,23,0.08)"
        gradientOpacity={0.24}
      >
        <div className="flex h-full flex-col justify-between gap-6 rounded-[inherit] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                {label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                {value}
              </p>
              <p className="mt-2 text-sm text-stone-500">{helper}</p>
            </div>
            <div className={`flex size-11 items-center justify-center rounded-2xl ${accent}`}>
              <Icon className="size-5 text-white" />
            </div>
          </div>

          {positive !== null ? (
            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Trend
              </span>
              <Badge
                variant="outline"
                className={
                  positive
                    ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "rounded-full border-rose-200 bg-rose-50 text-rose-700"
                }
              >
                {positive ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {changeValue > 0 ? "+" : ""}
                {changeValue.toFixed(1)}%
              </Badge>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Updated from current live totals
            </div>
          )}
        </div>
      </MagicCard>
    </BlurFade>
  );
}

export function AnalyticsCards({
  revenue,
  orders,
  users,
  averageOrderValue,
  revenueChange,
  ordersChange,
  usersChange,
}: AnalyticsCardsProps) {
  const stats = [
    {
      label: "Total revenue",
      value: formatCurrency(revenue),
      helper: "Collected from paid orders",
      change: revenueChange,
      accent: "bg-[linear-gradient(135deg,#0f172a,#0f766e)]",
      icon: Wallet,
    },
    {
      label: "Total orders",
      value: orders.toLocaleString("en-IN"),
      helper: "All orders processed to date",
      change: ordersChange,
      accent: "bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)]",
      icon: ShoppingCart,
    },
    {
      label: "Total users",
      value: users.toLocaleString("en-IN"),
      helper: "Customers with active accounts",
      change: usersChange,
      accent: "bg-[linear-gradient(135deg,#92400e,#f59e0b)]",
      icon: Users,
    },
    {
      label: "Average order value",
      value: formatCurrency(averageOrderValue),
      helper: "Average value per completed transaction",
      change: undefined,
      accent: "bg-[linear-gradient(135deg,#14532d,#22c55e)]",
      icon: Target,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          helper={stat.helper}
          change={stat.change}
          accent={stat.accent}
          icon={stat.icon}
          delay={0.04 * index}
        />
      ))}
    </div>
  );
}
