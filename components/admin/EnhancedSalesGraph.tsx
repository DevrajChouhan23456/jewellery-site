"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface EnhancedSalesGraphProps {
  data: SalesData[];
  title?: string;
  description?: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function EnhancedSalesGraph({
  data,
  title = "Sales overview",
  description = "Revenue and order count by day.",
}: EnhancedSalesGraphProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue / 100,
  }));

  const averageRevenue =
    formattedData.length > 0
      ? formattedData.reduce((sum, item) => sum + item.revenue, 0) /
        formattedData.length
      : 0;
  const averageOrders =
    formattedData.length > 0
      ? formattedData.reduce((sum, item) => sum + item.orders, 0) /
        formattedData.length
      : 0;
  const totalRevenue = formattedData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-stone-100 px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
            >
              Performance
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700">
              Revenue bars
            </Badge>
            <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
              Order line
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Avg daily revenue
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {formatCurrency(averageRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Avg daily orders
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {averageOrders.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Total period revenue
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {formattedData.length === 0 ? (
          <div className="flex min-h-[20rem] items-center justify-center rounded-[1.5rem] border border-dashed border-stone-200 bg-stone-50/60 text-sm text-stone-500">
            No sales data is available for the selected period yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={formattedData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#e7e5e4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
                tickFormatter={(value) =>
                  `Rs. ${Number(value).toLocaleString("en-IN")}`
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#0f766e", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(245, 245, 244, 0.7)" }}
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(231,229,228,1)",
                  borderRadius: "18px",
                  boxShadow: "0 20px 40px -24px rgba(28,25,23,0.28)",
                }}
                formatter={(value, name) => {
                  if (name === "Revenue") {
                    return [formatCurrency(Number(value)), "Revenue"];
                  }

                  return [Number(value).toLocaleString("en-IN"), "Orders"];
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="#d6a75c"
                radius={[14, 14, 0, 0]}
                maxBarSize={34}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#0f766e"
                strokeWidth={3}
                dot={{ fill: "#0f766e", r: 4 }}
                activeDot={{ r: 6, fill: "#0f766e" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
