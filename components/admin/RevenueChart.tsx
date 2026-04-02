"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue / 100, // Convert from paisa to rupees
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
        <XAxis
          dataKey="date"
          stroke="#78716c"
          fontSize={12}
        />
        <YAxis
          stroke="#78716c"
          fontSize={12}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => value ? [`₹${Number(value).toLocaleString()}`, "Revenue"] : ["₹0", "Revenue"]}
          labelStyle={{ color: "#1c1917" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: "0.5rem",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#a855f7"
          strokeWidth={2}
          dot={{ fill: "#a855f7", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#a855f7", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}