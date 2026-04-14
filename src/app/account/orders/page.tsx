import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUserOrders } from "@/lib/account";
import AccountSkeleton from "@/components/account/AccountSkeleton";

const statusCaps = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AccountOrdersPage() {
  const orders = await getCurrentUserOrders();

  return (
    <Suspense fallback={<AccountSkeleton />}>
      {orders.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-500">Looks like you haven&apos;t placed an order yet.</p>
          <Link
            href="/shop"
            className="mt-5 inline-flex rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900"
          >
            Start Shopping
          </Link>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold">My Orders</h1>

          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#faf8f1] text-slate-700">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono">{order.orderNumber}</td>
                    <td className="px-4 py-3">{new Date(order.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 font-semibold text-amber-900">{statusCaps[order.status] ?? order.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/track/${encodeURIComponent(order.orderNumber)}`}
                          className="rounded-lg bg-[#7a1f24] px-3 py-1 text-xs font-semibold text-white hover:bg-[#64181d]"
                        >
                          Track
                        </Link>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Suspense>
  );
}
