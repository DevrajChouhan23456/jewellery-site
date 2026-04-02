import Link from "next/link";
import { ArrowRight, DollarSign, PackagePlus, ShoppingBag, Users } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminProductDashboardData } from "@/server/services/admin/products";
import { 
  getAdminDashboardStats, 
  getRecentOrders,
  getEnhancedAnalytics,
  getLowStockProducts,
  getFunnelMetrics,
  getTrendingProducts,
  getSalesDropAlerts,
} from "@/server/services/admin/orders";
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { EnhancedSalesGraph } from "@/components/admin/EnhancedSalesGraph";
import { InventoryAlerts } from "@/components/admin/InventoryAlerts";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import AutomationDashboard from "@/components/admin/AutomationDashboard";

function formatDate(value: Date | null) {
  if (!value) {
    return "No products yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}

export default async function AdminDashboardPage() {
  await requireAdminPageAccess("/admin/dashboard");
  
  // Fetch all data in parallel
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
    getRecentOrders(10),
    getEnhancedAnalytics(30),
    getLowStockProducts(),
    getFunnelMetrics(30),
    getTrendingProducts(7),
    getSalesDropAlerts(7),
  ]);

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 luxury-shadow backdrop-blur">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              Admin Dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950">
              Complete business overview and operational control center.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--luxury-muted)] sm:text-base">
              Monitor revenue, orders, users, and top-selling products. Manage orders,
              track analytics, and maintain your luxury jewelry catalog.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Manage orders
                <ShoppingBag className="size-4" />
              </Link>
              <Link
                href="/admin/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                View analytics
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Manage catalog
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify-level Analytics Cards */}
      <section className="mt-8">
        <AnalyticsCards
          revenue={orderStats.totalRevenue}
          orders={orderStats.totalOrders}
          users={orderStats.totalUsers}
          averageOrderValue={enhancedAnalytics.averageOrderValue}
        />
      </section>

      {/* Sales Performance Graph */}
      <section className="mt-8">
        <EnhancedSalesGraph 
          data={enhancedAnalytics.dailyBreakdown}
          title="Sales Performance (Last 30 Days)"
          description="Revenue and order trends over time"
        />
      </section>

      {/* Inventory Alerts Section */}
      <section className="mt-8">
        <InventoryAlerts 
          lowStockProducts={lowStockProducts}
          trendingProducts={trendingProducts}
          salesDrops={salesDrops}
        />
      </section>

      {/* Conversion Funnel */}
      <section className="mt-8">
        <ConversionFunnel metrics={funnelMetrics} />
      </section>

      {/* Automation Dashboard */}
      <section className="mt-8">
        <AutomationDashboard />
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-950">Top Selling Products</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Best performing products by total units sold.
            </p>
          </div>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderStats.topSellingProducts.map((product) => (
              <div key={product?.id} className="flex items-center gap-4 rounded-lg border border-stone-200 p-4">
                <div className="size-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={product?.images?.[0] || "/placeholder.jpg"}
                    alt={product?.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-950 truncate">
                    {product?.name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {product?.totalSold} units sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-950">Recent Orders</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Latest customer orders and their status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders?format=csv"
              className="text-sm font-medium text-[var(--luxury-gold-deep)] transition hover:text-stone-950"
            >
              Export CSV
            </Link>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[var(--luxury-gold-deep)] transition hover:text-stone-950"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-stone-100">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[var(--luxury-muted)] sm:px-8">
              No orders yet.
            </div>
          ) : (
            recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-950">#{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                      {order.user?.name} • {order.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-950">
                      ₹{(order.totalAmount / 100).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    View
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-950">Recent products</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Latest catalog additions from the secured admin pipeline.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-[var(--luxury-gold-deep)] transition hover:text-stone-950"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {productDashboard.recentProducts.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[var(--luxury-muted)] sm:px-8">
              The catalog is empty. Add your first product to start merchandising the storefront.
            </div>
          ) : (
            productDashboard.recentProducts.map((product: any) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-[var(--luxury-gold-deep)]">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-950">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                      {product.category}
                      {product.subCategory ? ` / ${product.subCategory}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-950">
                      INR {product.price.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Added {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    Edit
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
