import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Layers3,
  TrendingUp,
} from "lucide-react";

import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { requireAdminPageAccess } from "@/server/auth/admin";
import {
  getAdminAnalytics,
  getAdminDashboardStats,
  getEnhancedAnalytics,
} from "@/server/services/admin/orders";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminAnalyticsPage() {
  await requireAdminPageAccess("/admin/analytics");

  const [analytics, dashboardStats, enhancedAnalytics] = await Promise.all([
    getAdminAnalytics(),
    getAdminDashboardStats(),
    getEnhancedAnalytics(30),
  ]);

  const chartRevenueData = enhancedAnalytics.dailyBreakdown.map((day) => ({
    date: day.date,
    revenue: day.revenue,
  }));

  const chartOrdersData = enhancedAnalytics.dailyBreakdown.map((day) => ({
    date: day.date,
    orders: day.orders,
  }));

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <BlurFade inView delay={0.04}>
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_24px_80px_-52px_rgba(28,25,23,0.38)] backdrop-blur">
            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href="/admin/dashboard">
                      <ArrowLeft className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700">
                    Analytics
                  </Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950">
                  Business performance, without the clutter.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Review revenue, order volume, category mix, and status
                  distribution in a layout that matches the new admin dashboard.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Top category
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {analytics.revenueByCategory[0]?.category || "N/A"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    30 day revenue
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {formatCurrency(enhancedAnalytics.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

        <AnalyticsCards
          revenue={dashboardStats.totalRevenue}
          orders={dashboardStats.totalOrders}
          users={dashboardStats.totalUsers}
          averageOrderValue={enhancedAnalytics.averageOrderValue}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <BlurFade inView delay={0.08}>
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
              <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-cyan-700" />
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                    Revenue trend
                  </h2>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Daily revenue movement across the last 30 days.
                </p>
              </div>
              <div className="p-6 sm:p-7">
                <RevenueChart data={chartRevenueData} />
              </div>
            </section>
          </BlurFade>

          <BlurFade inView delay={0.12}>
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
              <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-amber-700" />
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                    Order volume
                  </h2>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Daily order counts across the last 30 days.
                </p>
              </div>
              <div className="p-6 sm:p-7">
                <OrdersChart data={chartOrdersData} />
              </div>
            </section>
          </BlurFade>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <BlurFade inView delay={0.16}>
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-6 py-5 sm:px-7">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                    Orders by status
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Operational mix across the order pipeline.
                  </p>
                </div>
                <Layers3 className="size-5 text-stone-400" />
              </div>
              <div className="space-y-3 px-6 py-5 sm:px-7">
                {analytics.ordersByStatus.map((status) => (
                  <div
                    key={status.status}
                    className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-stone-50/80 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-stone-900">
                      {status.status}
                    </span>
                    <Badge
                      variant="outline"
                      className="rounded-full border-stone-200 bg-white text-stone-700"
                    >
                      {typeof status._count === "object" && status._count
                        ? status._count.id ?? 0
                        : 0}{" "}
                      orders
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </BlurFade>

          <BlurFade inView delay={0.2}>
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-6 py-5 sm:px-7">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                    Revenue by category
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Top categories contributing to paid order revenue.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                  <Link href="/admin/products">
                    Products
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3 px-6 py-5 sm:px-7">
                {analytics.revenueByCategory.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-stone-500">
                    Revenue categories will appear as paid order data grows.
                  </div>
                ) : (
                  analytics.revenueByCategory.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-stone-50/80 px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-stone-900">
                        {category.category}
                      </span>
                      <span className="text-sm text-stone-600">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </BlurFade>
        </div>
      </div>
    </AdminPageShell>
  );
}
