"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DemandData {
  date: string;
  orders: number;
  trend: "up" | "down" | "stable";
  percentage: number;
}

interface DemandPredictionProps {
  data: DemandData[];
  title?: string;
  description?: string;
}

export function DemandPrediction({
  data,
  title = "Demand Prediction (Last 7 Days)",
  description = "Daily order trends and predictions",
}: DemandPredictionProps) {
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="size-4 text-green-600" />;
      case "down":
        return <TrendingDown className="size-4 text-red-600" />;
      default:
        return <Minus className="size-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-1 text-sm text-[var(--luxury-muted)]">{description}</p>
      </div>

      <div className="px-6 py-8 sm:px-8">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-stone-500">No demand data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current trend summary */}
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-stone-950">{latestData?.orders || 0}</p>
                </div>
                {latestData && (
                  <div className="flex items-center gap-2">
                    {getTrendIcon(latestData.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(latestData.trend)}`}>
                      {latestData.percentage > 0 ? "+" : ""}{latestData.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily breakdown */}
            <div className="space-y-3">
              {data.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between rounded-lg border border-stone-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-stone-600">
                      {new Date(day.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-lg font-semibold text-stone-950">
                      {day.orders} orders
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(day.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(day.trend)}`}>
                      {day.percentage > 0 ? "+" : ""}{day.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}