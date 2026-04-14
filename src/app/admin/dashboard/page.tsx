import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrushCleaning,
  Package2,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";

import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import { EnhancedSalesGraph } from "@/components/admin/EnhancedSalesGraph";
import { InventoryAlerts } from "@/components/admin/InventoryAlerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { requireAdminPageAccess } from "@/server/auth/admin";
import {
  getAdminDashboardStats,
  getEnhancedAnalytics,
  getFunnelMetrics,
  getLowStockProducts,
  getRecentOrders,
  getSalesDropAlerts,
  getTrendingProducts,
} from "@/server/services/admin/orders";
import { getAdminProductDashboardData } from "@/server/services/admin/products";
import AutomationDashboard from "@/components/admin/AutomationDashboard";

function formatDate(value: Date | string | null) {
  if (!value) {
    return "No recent additions";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function paymentBadgeClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "AUTHORIZED":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "REFUNDED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

export default async function AdminDashboardPage() {
  await requireAdminPageAccess("/admin/dashboard");

  const [
    productDashboard,
    orderStats,
    recentOrders,
    enhancedAnalytics,
    lowStockProducts,
    funnelMetrics,
    trendingProducts,
    salesDrops,
  ] = await Promise.all([
    getAdminProductDashboardData(),
    getAdminDashboardStats(),
    getRecentOrders(8),
    getEnhancedAnalytics(30),
    getLowStockProducts(),
    getFunnelMetrics(30),
    getTrendingProducts(7),
    getSalesDropAlerts(7),
  ]);

  const commandStats = [
    {
      label: "Revenue today",
      value: formatCurrency(orderStats.revenueToday),
      helper: `${orderStats.ordersToday} orders today`,
      icon: Wallet,
    },
    {
      label: "Catalog products",
      value: productDashboard.totalProducts.toLocaleString("en-IN"),
      helper: `${productDashboard.addedThisMonth} added this month`,
      icon: Package2,
    },
    {
      label: "Last product sync",
      value: formatDate(productDashboard.lastCreatedAt),
      helper: "Most recent catalog addition",
      icon: Sparkles,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <BlurFade inView delay={0.05}>
          <MagicCard
            className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.4)]"
            gradientFrom="#d6a75c"
            gradientTo="#7dd3fc"
            gradientColor="rgba(214,167,92,0.12)"
            gradientOpacity={0.28}
          >
            <section className="relative overflow-hidden rounded-[inherit] px-6 py-7 sm:px-8 sm:py-8">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(214,167,92,0.24),transparent_58%)]" />
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

              <div className="relative">
                <Badge className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900">
                  Admin Command Center
                </Badge>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  Run the storefront with a cleaner, sharper operating view.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Track performance, respond to alerts, and move from orders to
                  catalog updates without losing context. The dashboard now
                  brings the most useful signals forward first.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-5">
                    <Link href="/admin/orders">
                      Manage orders
                      <ShoppingBag className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-stone-300 bg-white/85 px-5"
                  >
                    <Link href="/admin/products">
                      Update catalog
                      <Package2 className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="rounded-full px-5 text-stone-700 hover:bg-stone-100"
                  >
                    <Link href="/admin/analytics">
                      Explore analytics
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="rounded-full px-5 text-stone-700 hover:bg-stone-100"
                  >
                    <Link href="/admin/dashboard/logo">
                      Update branding
                      <BrushCleaning className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </MagicCard>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <section className="grid gap-4">
            {commandStats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <MagicCard
                  key={stat.label}
                  className="rounded-[1.75rem] border border-white/70 bg-white/82 shadow-[0_18px_60px_-45px_rgba(28,25,23,0.45)]"
                  gradientFrom={index === 0 ? "#d6a75c" : "#67e8f9"}
                  gradientTo={index === 0 ? "#fb923c" : "#facc15"}
                  gradientColor="rgba(15,23,42,0.08)"
                  gradientOpacity={0.22}
                >
                  <div className="flex items-start justify-between gap-4 rounded-[inherit] px-5 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">{stat.helper}</p>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-white/70 bg-stone-950 text-white shadow-[0_16px_35px_-22px_rgba(28,25,23,0.85)]">
                      <Icon className="size-5" />
                    </div>
                  </div>
                </MagicCard>
              );
            })}
          </section>
        </BlurFade>
      </div>

      <BlurFade inView delay={0.12}>
        <AnalyticsCards
          revenue={orderStats.totalRevenue}
          orders={orderStats.totalOrders}
          users={orderStats.totalUsers}
          averageOrderValue={enhancedAnalytics.averageOrderValue}
        />
      </BlurFade>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <BlurFade inView delay={0.16}>
          <EnhancedSalesGraph
            data={enhancedAnalytics.dailyBreakdown}
            title="Sales pulse"
            description="Revenue and order activity over the last 30 days."
          />
        </BlurFade>
        <BlurFade inView delay={0.18}>
          <InventoryAlerts
            lowStockProducts={lowStockProducts}
            trendingProducts={trendingProducts}
            salesDrops={salesDrops}
          />
        </BlurFade>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <BlurFade inView delay={0.2}>
          <ConversionFunnel metrics={funnelMetrics} />
        </BlurFade>
        <BlurFade inView delay={0.22}>
          <AutomationDashboard />
        </BlurFade>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BlurFade inView delay={0.24}>
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-stone-200 bg-stone-50 text-stone-700">
                    Best sellers
                  </Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                  Top selling products
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Best performing products by units sold.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                <Link href="/admin/products">
                  Catalog
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 sm:px-7">
              {orderStats.topSellingProducts.map((product) => (
                <div
                  key={product?.id}
                  className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                      <Image
                        src={product?.images?.[0] || "/images/product-placeholder.svg"}
                        alt={product?.name || "Top product"}
                        fill
                        sizes="56px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">
                        {product?.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {product?.totalSold} units sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </BlurFade>

        <BlurFade inView delay={0.26}>
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-7">
              <div>
                <Badge variant="outline" className="rounded-full border-stone-200 bg-stone-50 text-stone-700">
                  Fresh in catalog
                </Badge>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                  Recent products
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Latest additions from the admin pipeline.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                <Link href="/admin/products">
                  View all
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="divide-y divide-stone-100">
              {productDashboard.recentProducts.length === 0 ? (
                <div className="px-6 py-12 text-sm text-stone-500 sm:px-7">
                  The catalog is empty. Add your first product to begin
                  merchandising.
                </div>
              ) : (
                productDashboard.recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:px-7 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold text-stone-950">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {product.category}
                        {product.subCategory ? ` / ${product.subCategory}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-950">
                          INR {product.price.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          Added {formatDate(product.createdAt)}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`/admin/products/${product.id}`}>
                          Edit
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </BlurFade>
      </div>

      <BlurFade inView delay={0.28}>
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-stone-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <Badge variant="outline" className="rounded-full border-stone-200 bg-stone-50 text-stone-700">
                Live order feed
              </Badge>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                Recent orders
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Latest customer orders and their current fulfillment state.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                <Link href="/admin/orders?format=csv">Export CSV</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/admin/orders">
                  View all
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-sm text-stone-500 sm:px-7">
                No orders yet.
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:px-7 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700">
                      <ShoppingBag className="size-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-stone-950">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {order.user?.name ?? "Guest"}{" "}
                        {order.user?.email ? `• ${order.user.email}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full ${statusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`rounded-full ${paymentBadgeClass(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="text-left xl:text-right">
                      <p className="text-sm font-semibold text-stone-950">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`/admin/orders/${order.id}`}>
                        View order
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </BlurFade>

      <BlurFade inView delay={0.3}>
        <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(28,25,23,0.96),rgba(68,64,60,0.92),rgba(214,167,92,0.85))] px-6 py-6 text-white shadow-[0_24px_70px_-40px_rgba(28,25,23,0.85)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                Next move
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Keep the admin workflow fast and focused.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-stone-200">
                Jump into the pages that need attention most: orders awaiting
                action, product maintenance, or the broader analytics view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-stone-950 hover:bg-stone-100"
              >
                <Link href="/admin/orders">
                  Open orders
                  <ShoppingBag className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/admin/analytics">
                  Review analytics
                  <BarChart3 className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </BlurFade>
    </div>
  );
}
