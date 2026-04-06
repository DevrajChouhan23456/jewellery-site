"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue / 100,
  }));

  const tooltipFormatter = (
    value: number | string | readonly (number | string)[] | undefined,
  ) => {
    const numericValue = Array.isArray(value)
      ? Number(value[0] ?? 0)
      : Number(value ?? 0);

    return [
      `Rs. ${numericValue.toLocaleString("en-IN")}`,
      "Revenue",
    ] as [string, string];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" />
        <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
        <YAxis
          stroke="#78716c"
          fontSize={12}
          tickFormatter={(value) => `Rs. ${value.toLocaleString("en-IN")}`}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelStyle={{ color: "#1c1917" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 40px -24px rgba(28,25,23,0.28)",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0f766e"
          strokeWidth={3}
          dot={{ fill: "#0f766e", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#0f766e", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
