import Link from "next/link";
import { ArrowLeft, PackageCheck, Search, Truck } from "lucide-react";

import { AdminOrdersLiveManager } from "@/components/admin/AdminOrdersLiveManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminOrders } from "@/server/services/admin/orders";

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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
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

  const activeFilterCount = [search, status, paymentStatus, dateFrom, dateTo].filter(
    (value) => Boolean(value),
  ).length;

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <BlurFade inView delay={0.04}>
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_24px_80px_-52px_rgba(28,25,23,0.38)] backdrop-blur">
            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href="/admin/dashboard">
                      <ArrowLeft className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                    Order workspace
                  </Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950">
                  Keep fulfillment moving with a calmer, clearer order view.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Search, filter, export, and update orders from one live control
                  surface with better hierarchy and less visual noise.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <PackageCheck className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Orders
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {pagination.totalCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Truck className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Pages
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {pagination.totalPages}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Search className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Filters
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {activeFilterCount}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

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
      </div>
    </AdminPageShell>
  );
}
