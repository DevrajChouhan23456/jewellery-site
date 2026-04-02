"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { toast } from "react-hot-toast";

type AdminOrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  items: AdminOrderItem[];
};

type PaginationInfo = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

type AdminOrdersLiveManagerProps = {
  initialOrders: AdminOrder[];
  initialPagination: PaginationInfo;
  initialFilters: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  };
};

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUS_OPTIONS = ["ALL", "PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminOrdersLiveManager({
  initialOrders,
  initialPagination,
  initialFilters,
}: AdminOrdersLiveManagerProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [filters, setFilters] = useState(() => ({
    search: initialFilters.search || "",
    status: initialFilters.status || "ALL",
    paymentStatus: initialFilters.paymentStatus || "ALL",
    dateFrom: initialFilters.dateFrom || "",
    dateTo: initialFilters.dateTo || "",
  }));
  const [currentPage, setCurrentPage] = useState(initialPagination.page || 1);
  const [pageSize, setPageSize] = useState(initialPagination.limit || 20);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(() => new Date());
  const [realTimeActive, setRealTimeActive] = useState(true);

  const totalPages = useMemo(() => pagination.totalPages || 1, [pagination.totalPages]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(pageSize));
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters.paymentStatus && filters.paymentStatus !== "ALL") params.set("paymentStatus", filters.paymentStatus);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [currentPage, pageSize, filters.search, filters.status, filters.paymentStatus, filters.dateFrom, filters.dateTo]);

  const loadOrders = useMemo(() => {
    return async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/orders?${queryString}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to load orders");
        }

        const payload = await response.json();
        setOrders(payload.orders || []);
        setPagination(payload.pagination || { page: 1, limit: pageSize, totalCount: 0, totalPages: 1 });
        setLastSync(new Date());
      } catch (error) {
        console.error("Failed to fetch admin orders:", error);
        toast.error("Unable to fetch orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  }, [queryString, pageSize]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!realTimeActive) return;
    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/orders?${queryString}`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!payload || !payload.orders) return;

        const stale =
          payload.pagination.totalCount !== pagination.totalCount ||
          payload.orders.length > 0 && orders.length > 0 && payload.orders[0].id !== orders[0].id;

        if (stale) {
          setOrders(payload.orders);
          setPagination(payload.pagination);
          setLastSync(new Date());
          toast.success("Order list synchronized with live updates.");
        }
      } catch (err) {
        console.error("Real-time refresh failed:", err);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [realTimeActive, queryString, pagination.totalCount, orders]);

  const onFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const exportParams = new URLSearchParams(queryString);
      exportParams.set("format", "csv");

      const response = await fetch(`/api/admin/orders?${exportParams.toString()}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `orders-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Order export is downloading.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to export orders CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={filters.search}
            onChange={event => onFilterChange("search", event.target.value)}
            placeholder="Search order number, customer name, email"
            className="w-full max-w-xs rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <select
            value={filters.status}
            onChange={event => onFilterChange("status", event.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={event => onFilterChange("paymentStatus", event.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {PAYMENT_STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={event => onFilterChange("dateFrom", event.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={event => onFilterChange("dateTo", event.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="ml-auto rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span>Live updates: </span>
          <button
            type="button"
            onClick={() => setRealTimeActive(prev => !prev)}
            className="rounded-md border px-2 py-1 text-[11px]"
          >
            {realTimeActive ? "Pause" : "Resume"}
          </button>
          <span>Last sync: {formatDate(lastSync.toISOString())}</span>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-700">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  No orders found with these filters.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {order.user?.name || "-"}
                    <div className="text-xs text-stone-500">{order.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-[11px]">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-[11px]">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-800">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100"
                    >
                      View
                    </Link>
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-3 text-sm">
        <div>
          Showing page {pagination.page} of {totalPages}, {pagination.totalCount} orders
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border px-3 py-1 text-xs disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={pagination.page >= totalPages}
            className="rounded-lg border px-3 py-1 text-xs disabled:opacity-50"
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={event => {
              const value = Number(event.target.value);
              setPageSize(value);
              setCurrentPage(1);
            }}
            className="rounded-lg border px-2 py-1 text-xs"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}/page
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
