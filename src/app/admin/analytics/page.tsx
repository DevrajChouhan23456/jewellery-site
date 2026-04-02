import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminAnalytics } from "@/server/services/admin/orders";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersChart } from "@/components/admin/OrdersChart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export default async function AdminAnalyticsPage() {
  await requireAdminPageAccess("/admin/analytics");
  const analytics = await getAdminAnalytics();

  // Calculate some basic metrics
  const totalRevenue = 0; // Simplified for now
  const totalOrders = 0; // Simplified for now
  const avgOrderValue = 0; // Simplified for now

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-stone-950">Analytics</h1>
          <p className="text-stone-600">Business insights and performance metrics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-stone-600">Total Revenue (30d)</p>
              <p className="text-2xl font-bold text-stone-950">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-stone-600">Total Orders (30d)</p>
              <p className="text-2xl font-bold text-stone-950">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-stone-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-stone-950">{formatCurrency(avgOrderValue)}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-stone-600">Top Category</p>
              <p className="text-2xl font-bold text-stone-950">
                {analytics.revenueByCategory[0]?.category || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
          <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-stone-950">Revenue Trend</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Daily revenue for the last 30 days
            </p>
          </div>
          <div className="p-6">
            <RevenueChart data={analytics.dailyRevenue} />
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
          <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-stone-950">Orders Trend</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Daily orders for the last 30 days
            </p>
          </div>
          <div className="p-6">
            <OrdersChart data={analytics.dailyOrders} />
          </div>
        </section>
      </div>

      {/* Additional Analytics */}
      <div className="grid gap-8 lg:grid-cols-2 mt-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
          <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-stone-950">Orders by Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.ordersByStatus.map((status: any) => (
                <div key={status.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">{status.status}</span>
                  <span className="text-sm text-stone-600">{status._count.id} orders</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
          <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-stone-950">Revenue by Category</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.revenueByCategory.slice(0, 5).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">{category.category}</span>
                  <span className="text-sm text-stone-600">{formatCurrency(category.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}