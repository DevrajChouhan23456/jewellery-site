"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface OrdersChartProps {
  data: Array<{ date: string; orders: number }>;
}

export function OrdersChart({ data }: OrdersChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
        <XAxis
          dataKey="date"
          stroke="#78716c"
          fontSize={12}
        />
        <YAxis
          stroke="#78716c"
          fontSize={12}
        />
        <Tooltip
          formatter={(value: any) => [value || 0, "Orders"]}
          labelStyle={{ color: "#1c1917" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: "0.5rem",
          }}
        />
        <Bar
          dataKey="orders"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}