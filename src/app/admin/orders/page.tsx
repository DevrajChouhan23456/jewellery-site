import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminOrders } from "@/server/services/admin/orders";
import { AdminOrdersLiveManager } from "@/components/admin/AdminOrdersLiveManager";

interface AdminOrdersPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdminPageAccess("/admin/orders");

  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const paymentStatus = searchParams.paymentStatus || "";
  const dateFrom = searchParams.dateFrom || "";
  const dateTo = searchParams.dateTo || "";

  const { orders, pagination } = await getAdminOrders({
    page,
    search,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
  });

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-stone-950">Order Management</h1>
          <p className="text-stone-600">Manage and track all customer orders</p>
        </div>
      </div>

      <AdminOrdersLiveManager
        initialOrders={orders}
        initialPagination={pagination}
        initialFilters={{
          search,
          status,
          paymentStatus,
          dateFrom,
          dateTo,
        }}
      />
    </main>
  );
}
