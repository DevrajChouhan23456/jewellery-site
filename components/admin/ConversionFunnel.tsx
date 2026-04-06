"use client";

import { ArrowDown, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";

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
      percentage: 100,
      accent:
        "bg-[linear-gradient(90deg,rgba(15,23,42,0.96),rgba(8,145,178,0.92))]",
    },
    {
      name: "Add to cart",
      value: metrics.usersWithCart,
      percentage:
        metrics.totalVisitors > 0
          ? (metrics.usersWithCart / metrics.totalVisitors) * 100
          : 0,
      accent:
        "bg-[linear-gradient(90deg,rgba(13,148,136,0.95),rgba(56,189,248,0.9))]",
    },
    {
      name: "Completed orders",
      value: metrics.completedOrders,
      percentage:
        metrics.totalVisitors > 0
          ? (metrics.completedOrders / metrics.totalVisitors) * 100
          : 0,
      accent:
        "bg-[linear-gradient(90deg,rgba(146,64,14,0.95),rgba(250,204,21,0.9))]",
    },
  ] as const;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
        <Badge
          variant="outline"
          className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
        >
          Funnel
        </Badge>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
          Conversion funnel
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          See where shoppers are moving smoothly and where they are dropping off.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-7">
        {stages.map((stage, index) => {
          const nextStage = stages[index + 1];
          const dropoff = nextStage ? Math.max(stage.value - nextStage.value, 0) : 0;
          const dropoffRate =
            nextStage && stage.value > 0
              ? ((stage.value - nextStage.value) / stage.value) * 100
              : 0;

          return (
            <div key={stage.name} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-950">
                    {stage.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {stage.value.toLocaleString("en-IN")} people
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
                >
                  {stage.percentage.toFixed(1)}%
                </Badge>
              </div>

              <div className="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-stone-100/80">
                <div
                  className={`flex h-14 items-center rounded-[1.15rem] px-4 text-sm font-semibold text-white ${stage.accent}`}
                  style={{ width: `${Math.max(stage.percentage, 8)}%` }}
                >
                  {stage.value.toLocaleString("en-IN")}
                </div>
              </div>

              {nextStage ? (
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <ArrowDown className="size-3.5" />
                  <TrendingDown className="size-3.5" />
                  {dropoff.toLocaleString("en-IN")} dropped before{" "}
                  {nextStage.name.toLowerCase()} ({dropoffRate.toFixed(1)}%)
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Add to cart
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.cartConversion.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Checkout conversion
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.checkoutConversion.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Overall conversion
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {metrics.conversionRates.overall.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
