"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

export function EnhancedSalesGraph({
  data,
  title = "Sales Overview (Last 30 Days)",
  description = "Revenue and order count by day",
}: EnhancedSalesGraphProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue / 100, // Convert from paisa to rupees
  }));

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
        <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-1 text-sm text-[var(--luxury-muted)]">{description}</p>
      </div>

      <div className="px-6 py-8 sm:px-8">
        {formattedData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-stone-500">No data available for the selected period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={formattedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f5f5f4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#78716c"
                fontSize={12}
                tick={{ fill: "#78716c" }}
              />
              <YAxis
                stroke="#78716c"
                fontSize={12}
                tick={{ fill: "#78716c" }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                yAxisId="left"
              />
              <YAxis
                stroke="#a855f7"
                fontSize={12}
                tick={{ fill: "#a855f7" }}
                yAxisId="right"
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e7e5e4",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue") {
                    return [`₹${Number(value).toLocaleString()}`, "Revenue"];
                  }
                  return [value, "Orders"];
                }}
                labelStyle={{ color: "#1c1917" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
              <Bar
                dataKey="revenue"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                yAxisId="left"
                name="Revenue (₹)"
                opacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: "#a855f7", r: 4 }}
                activeDot={{ r: 6 }}
                yAxisId="right"
                name="Orders"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats below chart */}
      {formattedData.length > 0 && (
        <div className="border-t border-stone-100 grid grid-cols-3 divide-x divide-stone-100 px-6 py-4 sm:px-8">
          <div>
            <p className="text-xs font-medium text-stone-500">Avg Daily Revenue</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              ₹{(
                formattedData.reduce((sum, d) => sum + d.revenue, 0) /
                formattedData.length
              ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="pl-4 sm:pl-6">
            <p className="text-xs font-medium text-stone-500">Avg Daily Orders</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {(
                formattedData.reduce((sum, d) => sum + d.orders, 0) /
                formattedData.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="pl-4 sm:pl-6">
            <p className="text-xs font-medium text-stone-500">Total Period Revenue</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              ₹{formattedData
                .reduce((sum, d) => sum + d.revenue, 0)
                .toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
