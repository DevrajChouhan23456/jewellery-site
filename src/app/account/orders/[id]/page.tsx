import Link from "next/link";

import { getCurrentUserOrderById } from "@/lib/account";

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

type OrderStatusStep = (typeof statusSteps)[number];

function getStatusOrder(status: string) {
  return statusSteps.indexOf(status as OrderStatusStep);
}

export default async function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getCurrentUserOrderById(params.id);

  if (!order) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="mt-2 text-sm text-rose-700">This order either does not exist or belongs to another account.</p>
        <Link href="/account/orders" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-800">
          Back to orders
        </Link>
      </section>
    );
  }

  const shipping =
    typeof order.shippingAddress === "object" && order.shippingAddress !== null
      ? (order.shippingAddress as {
          addressLine1?: string;
          city?: string;
          postalCode?: string;
          state?: string;
          country?: string;
        })
      : {};

  const subtotal = order.subtotalAmount;
  const tax = order.taxAmount;
  const shippingCost = order.shippingAmount;
  const discount = order.discountAmount;
  const total = order.totalAmount;

  return (
    <section className="space-y-6 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Order Details</h1>
        <p className="rounded-xl bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{order.status}</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-sm text-slate-600">Order ID: <span className="font-mono">{order.orderNumber}</span></p>
        <p className="text-sm text-slate-600">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="text-sm text-slate-600">Payment status: {order.paymentStatus}</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Status timeline</h2>
        <div className="space-y-2">
          {statusSteps.map((step, index) => {
            const active = index <= getStatusOrder(order.status);
            return (
              <div key={step} className="flex items-center gap-3">
                <span className={`inline-flex h-3 w-3 rounded-full ${active ? "bg-amber-500" : "bg-slate-300"}`} />
                <span className={`text-sm ${active ? "font-semibold text-slate-900" : "text-slate-500"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            const name = item.product?.name || "Unknown product";
            const unitPrice = item.unitPrice;
            return (
              <article key={item.id} className="rounded-lg border border-stone-100 p-3">
                <div className="flex justify-between">
                  <p className="font-medium">{name}</p>
                  <p className="font-semibold">₹{(item.lineTotal ?? item.quantity * unitPrice).toLocaleString("en-IN")}</p>
                </div>
                <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{unitPrice.toLocaleString("en-IN")}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Price breakdown</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>₹{subtotal.toLocaleString("en-IN")}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>₹{tax.toLocaleString("en-IN")}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>₹{shippingCost.toLocaleString("en-IN")}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>-₹{discount.toLocaleString("en-IN")}</dd></div>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-2 font-semibold"><dt>Total</dt><dd>₹{total.toLocaleString("en-IN")}</dd></div>
        </dl>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Delivery info</h2>
        <p className="text-sm text-slate-700">{shipping.addressLine1 ?? "Address unavailable"}</p>
        <p className="text-sm text-slate-700">{shipping.city ?? ""} {shipping.postalCode || ""}</p>
        <p className="text-sm text-slate-700">{shipping.state ?? ""} {shipping.country ?? ""}</p>
      </div>

      <Link
        href="/account/orders"
        className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
      >
        Back to Orders
      </Link>
    </section>
  );
}
