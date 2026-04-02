"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
}

interface TrendingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salesChange: number; // percentage change
  images?: string[];
}

interface SalesDropAlert {
  productId: string;
  productName: string;
  productSlug: string;
  previousSales: number;
  currentSales: number;
  dropPercentage: number;
  images?: string[];
}

interface InventoryAlertsProps {
  lowStockProducts: LowStockProduct[];
  trendingProducts?: TrendingProduct[];
  salesDrops?: SalesDropAlert[];
}

export function InventoryAlerts({
  lowStockProducts,
  trendingProducts = [],
  salesDrops = [],
}: InventoryAlertsProps) {
  const totalAlerts = lowStockProducts.length + trendingProducts.length + salesDrops.length;

  if (totalAlerts === 0) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 px-6 py-8 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-green-100/80 p-3">
            <AlertCircle className="size-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">All Systems Healthy</h3>
            <p className="mt-1 text-sm text-green-700">No inventory or sales alerts at this moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100/80 p-2">
              <AlertCircle className="size-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950">Intelligent Alerts</h2>
              <p className="mt-0.5 text-sm text-[var(--luxury-muted)]">
                {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
          <Link
            href="/admin/alerts"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--luxury-gold-deep)] transition hover:text-stone-950"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-stone-100">
        {/* Low Stock Alerts */}
        {lowStockProducts.slice(0, 3).map((product) => {
          const stockPercentage = Math.round((product.stock / product.lowStockThreshold) * 100);
          const isLowStock = product.stock <= product.lowStockThreshold;

          return (
            <Link
              key={`low-stock-${product.id}`}
              href={`/admin/products/${product.id}`}
              className="block py-4 px-6 sm:px-8 transition hover:bg-stone-50"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-950 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone-500">
                    Low stock: {product.stock} of {product.lowStockThreshold} units
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full transition-all ${isLowStock ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isLowStock ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stockPercentage}%
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Trending Products */}
        {trendingProducts.slice(0, 3).map((product) => (
          <Link
            key={`trending-${product.id}`}
            href={`/admin/products/${product.id}`}
            className="block py-4 px-6 sm:px-8 transition hover:bg-stone-50"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  className="size-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-950 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-stone-500">
                  Trending product
                </p>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{product.salesChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Sales Drop Alerts */}
        {salesDrops.slice(0, 3).map((alert) => (
          <Link
            key={`sales-drop-${alert.productId}`}
            href={`/admin/products/${alert.productId}`}
            className="block py-4 px-6 sm:px-8 transition hover:bg-stone-50"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={alert.images?.[0] || "/placeholder.jpg"}
                  alt={alert.productName}
                  className="size-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-950 truncate">
                  {alert.productName}
                </h3>
                <p className="text-sm text-stone-500">
                  Sales dropped {alert.dropPercentage.toFixed(1)}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  -{alert.dropPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalAlerts > 9 && (
        <div className="border-t border-stone-100 bg-stone-50/50 px-6 py-4 sm:px-8 text-center">
          <p className="text-sm text-stone-600">
            +{totalAlerts - 9} more alert{totalAlerts - 9 !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </section>
  );
}
