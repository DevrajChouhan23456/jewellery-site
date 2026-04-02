"use client";

import { TrendingDown } from "lucide-react";

interface FunnelMetrics {
  totalVisitors: number;
  usersWithCart: number;
  completedOrders: number;
  conversionRates: {
    cartConversion: number;
    checkoutConversion: number;
    overall: number;
  };
}

interface ConversionFunnelProps {
  metrics: FunnelMetrics;
}

export function ConversionFunnel({ metrics }: ConversionFunnelProps) {
  const stages = [
    {
      name: "Visitors",
      value: metrics.totalVisitors,
      color: "from-blue-500 to-blue-600",
      percentage: 100,
    },
    {
      name: "Add to Cart",
      value: metrics.usersWithCart,
      color: "from-purple-500 to-purple-600",
      percentage: metrics.totalVisitors > 0 
        ? (metrics.usersWithCart / metrics.totalVisitors) * 100 
        : 0,
    },
    {
      name: "Completed Orders",
      value: metrics.completedOrders,
      color: "from-emerald-500 to-emerald-600",
      percentage: metrics.usersWithCart > 0 
        ? (metrics.completedOrders / metrics.usersWithCart) * 100 
        : 0,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
        <h2 className="text-xl font-semibold text-stone-950">Conversion Funnel</h2>
        <p className="mt-1 text-sm text-[var(--luxury-muted)]">
          Track visitor journey through checkout
        </p>
      </div>

      <div className="px-6 py-8 sm:px-8">
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.name}>
              {/* Stage header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-stone-950">{stage.name}</h3>
                  <p className="text-sm text-stone-500">
                    {stage.value.toLocaleString()} users
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-900">
                  {stage.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Stage bar */}
              <div className="h-12 overflow-hidden rounded-lg bg-stone-100">
                <div
                  className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500 flex items-center px-4`}
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage > 20 && (
                    <span className="text-sm font-semibold text-white truncate">
                      {stage.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Drop-off indicator */}
              {index < stages.length - 1 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-stone-600">
                  <TrendingDown className="size-4" />
                  <span>
                    {stages[index].value - stages[index + 1].value} dropped off (
                    {(
                      ((stages[index].value - stages[index + 1].value) /
                        stages[index].value) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conversion rates summary */}
        <div className="mt-8 grid grid-cols-3 gap-4 rounded-lg border border-stone-200 bg-stone-50/50 p-4">
          <div>
            <p className="text-xs font-medium text-stone-500">Add to Cart</p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.cartConversion.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Checkout</p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.checkoutConversion.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Overall</p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.overall.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
