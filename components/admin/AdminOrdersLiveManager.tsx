"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCcw, Search } from "lucide-react";
import { toast } from "react-hot-toast";

import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
];

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

function orderStatusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function paymentStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "AUTHORIZED":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "REFUNDED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
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

  const totalPages = useMemo(
    () => pagination.totalPages || 1,
    [pagination.totalPages],
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(pageSize));
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "ALL") {
      params.set("status", filters.status);
    }
    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      params.set("paymentStatus", filters.paymentStatus);
    }
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [
    currentPage,
    pageSize,
    filters.search,
    filters.status,
    filters.paymentStatus,
    filters.dateFrom,
    filters.dateTo,
  ]);

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
        setPagination(
          payload.pagination || {
            page: 1,
            limit: pageSize,
            totalCount: 0,
            totalPages: 1,
          },
        );
        setLastSync(new Date());
      } catch (error) {
        console.error("Failed to fetch admin orders:", error);
        toast.error("Unable to fetch orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  }, [pageSize, queryString]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!realTimeActive) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/orders?${queryString}`);
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (!payload || !payload.orders) {
          return;
        }

        const stale =
          payload.pagination.totalCount !== pagination.totalCount ||
          (payload.orders.length > 0 &&
            orders.length > 0 &&
            payload.orders[0].id !== orders[0].id);

        if (stale) {
          setOrders(payload.orders);
          setPagination(payload.pagination);
          setLastSync(new Date());
          toast.success("Order list synchronized with live updates.");
        }
      } catch (error) {
        console.error("Real-time refresh failed:", error);
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [orders, pagination.totalCount, queryString, realTimeActive]);

  const onFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
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
      <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
        <CardHeader className="border-b border-stone-100 px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-stone-950">
                Filter and monitor
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-stone-500">
                Search by customer or order number, then narrow the live list by
                status, payment, and date range.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  realTimeActive
                    ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "rounded-full border-stone-200 bg-stone-50 text-stone-700"
                }
              >
                {realTimeActive ? "Live sync on" : "Live sync paused"}
              </Badge>
              <span className="text-xs text-stone-500">
                Last sync: {formatDate(lastSync.toISOString())}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-6 py-5 sm:px-7">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={filters.search}
                onChange={(event) => onFilterChange("search", event.target.value)}
                placeholder="Search order number, customer, or email"
                className="h-11 rounded-2xl border-stone-200 bg-white pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-stone-200 bg-white px-3">
                <SelectValue placeholder="Order status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => onFilterChange("paymentStatus", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-stone-200 bg-white px-3">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-full"
                onClick={() => setRealTimeActive((current) => !current)}
              >
                <RefreshCcw className="size-4" />
                {realTimeActive ? "Pause sync" : "Resume sync"}
              </Button>
              <Button
                className="h-11 rounded-full"
                onClick={() => void handleExportCsv()}
                disabled={isExporting}
              >
                <Download className="size-4" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_auto]">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onFilterChange("dateFrom", event.target.value)}
              className="h-11 rounded-2xl border-stone-200 bg-white"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onFilterChange("dateTo", event.target.value)}
              className="h-11 rounded-2xl border-stone-200 bg-white"
            />
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-stone-200 bg-white px-3">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
        <CardHeader className="border-b border-stone-100 px-6 py-5 sm:px-7">
          <CardTitle className="text-lg font-semibold text-stone-950">
            Orders
          </CardTitle>
          <CardDescription className="text-sm text-stone-500">
            Showing page {pagination.page} of {totalPages} with{" "}
            {pagination.totalCount} total orders.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader className="bg-stone-50/80">
              <TableRow className="border-stone-100 hover:bg-stone-50/80">
                <TableHead className="px-6 py-4 sm:px-7">Order</TableHead>
                <TableHead className="px-2 py-4">Customer</TableHead>
                <TableHead className="px-2 py-4">Status</TableHead>
                <TableHead className="px-2 py-4">Payment</TableHead>
                <TableHead className="px-2 py-4">Total</TableHead>
                <TableHead className="px-2 py-4">Created</TableHead>
                <TableHead className="px-6 py-4 text-right sm:px-7">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-stone-500 sm:px-7"
                  >
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-stone-500 sm:px-7"
                  >
                    No orders found with these filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-stone-100">
                    <TableCell className="px-6 py-4 sm:px-7">
                      <div>
                        <p className="font-semibold text-stone-950">
                          #{order.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {order.items.length} item
                          {order.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-4">
                      <p className="font-medium text-stone-800">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {order.user?.email || "No email"}
                      </p>
                    </TableCell>
                    <TableCell className="px-2 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full ${orderStatusClass(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full ${paymentStatusClass(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-4 font-medium text-stone-900">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="px-2 py-4 text-sm text-stone-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right sm:px-7">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                        <OrderStatusUpdater
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-white/70 bg-white/86 py-0 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)]">
        <CardContent className="flex flex-col gap-4 px-6 py-5 sm:px-7 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-stone-500">
            Showing page {pagination.page} of {totalPages} across{" "}
            {pagination.totalCount} orders.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setCurrentPage((current) => Math.max(current - 1, 1))}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                setCurrentPage((current) => Math.min(current + 1, totalPages))
              }
              disabled={pagination.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
