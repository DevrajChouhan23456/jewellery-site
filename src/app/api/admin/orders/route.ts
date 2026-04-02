import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getAdminOrders } from "@/server/services/admin/orders";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const search = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const paymentStatus = url.searchParams.get("paymentStatus") ?? "";
    const dateFrom = url.searchParams.get("dateFrom") ?? "";
    const dateTo = url.searchParams.get("dateTo") ?? "";
    const format = url.searchParams.get("format") ?? "json";

    const { orders, pagination } = await getAdminOrders({
      page,
      limit,
      search,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
    });

    if (format === "csv") {
      const csvRows = [
        ["Order Number", "Customer", "Customer Email", "Status", "Payment Status", "Total", "Created At", "Updated At"],
        ...orders.map(order => [
          order.orderNumber,
          order.user?.name || "",
          order.user?.email || "",
          order.status,
          order.paymentStatus,
          (order.totalAmount / 100).toFixed(2),
          new Date(order.createdAt).toISOString(),
          new Date(order.updatedAt).toISOString(),
        ]),
      ];

      const csvContent = csvRows
        .map(row =>
          row
            .map(value => {
              const cell = String(value).replace(/"/g, '""');
              return `"${cell}"`;
            })
            .join(",")
        )
        .join("\n");

      const fileName = `admin-orders-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json({ orders, pagination });
  } catch (error) {
    console.error("Error in admin orders route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
