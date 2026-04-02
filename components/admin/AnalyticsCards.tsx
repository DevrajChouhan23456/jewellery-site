"use client";

import { TrendingUp, ShoppingCart, Users, Target } from "lucide-react";

interface AnalyticsCardsProps {
  revenue: number;
  orders: number;
  users: number;
  averageOrderValue: number;
  revenueChange?: number;
  ordersChange?: number;
  usersChange?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  subtext,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  change?: number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-gradient-to-br from-stone-50/70 to-stone-50/40 p-6 backdrop-blur transition hover:border-stone-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-stone-950">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-stone-500">{subtext}</p>
          )}
          {change !== undefined && (
            <div className="mt-3 flex items-center gap-1">
              <TrendingUp className={`size-4 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-xl ${color} p-3`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </div>
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: amount > 100000 ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={ShoppingCart}
        label="Total Revenue"
        value={formatCurrency(revenue)}
        change={revenueChange}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatCard
        icon={ShoppingCart}
        label="Total Orders"
        value={orders.toLocaleString()}
        change={ordersChange}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
      />
      <StatCard
        icon={Users}
        label="Total Users"
        value={users.toLocaleString()}
        change={usersChange}
        color="bg-gradient-to-br from-amber-500 to-amber-600"
      />
      <StatCard
        icon={Target}
        label="Average Order Value"
        value={formatCurrency(averageOrderValue)}
        subtext="Per transaction"
        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
      />
    </div>
  );
}
