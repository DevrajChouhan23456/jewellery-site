import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, User } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminOrderById } from "@/server/services/admin/orders";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100); // Assuming amount is in paisa
}

function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dateObj);
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800";
    case "SHIPPED":
      return "bg-orange-100 text-orange-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "AUTHORIZED":
      return "bg-blue-100 text-blue-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

type ShippingAddress = {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

function getShippingAddress(value: unknown): ShippingAddress | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ShippingAddress;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  await requireAdminPageAccess(`/admin/orders/${id}`);
  const order = await getAdminOrderById(id);

  if (!order) {
    return (
      <main className="luxury-shell py-10 sm:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-950">Order not found</h1>
          <Link href="/admin/orders" className="mt-4 inline-block text-[var(--luxury-gold-deep)]">
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const shippingAddress = getShippingAddress(order.shippingAddress);

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
        >
          <ArrowLeft className="size-4" />
          Back to Orders
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-stone-950">Order {order.orderNumber}</h1>
          <p className="text-stone-600">Order details and management</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
            <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-stone-950">Order Items</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-6">
                  <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.product.images?.[0] || "/images/product-placeholder.svg"}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-950">{item.product.name}</h3>
                    {item.product.isArchived ? (
                      <p className="text-xs text-stone-500">Archived from the live catalog</p>
                    ) : null}
                    <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-stone-950">
                      {formatCurrency(item.lineTotal)}
                    </p>
                    <p className="text-sm text-stone-600">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Timeline */}
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
            <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-stone-950">Order Timeline</h2>
            </div>
            <div className="px-6 py-5 sm:px-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-stone-950">Order Placed</p>
                    <p className="text-sm text-stone-600">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.status !== "PENDING" && (
                  <div className="flex items-center gap-4">
                    <div className="size-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-stone-950">Status Updated to {order.status}</p>
                      <p className="text-sm text-stone-600">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-8">
          {/* Status Management */}
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
            <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-stone-950">Order Status</h2>
            </div>
            <div className="px-6 py-5 sm:px-8 space-y-4">
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </section>

          {/* Customer Details */}
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
            <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-stone-950">Customer Details</h2>
            </div>
            <div className="px-6 py-5 sm:px-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="size-4 text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-950">{order.user?.name || "Guest"}</p>
                    <p className="text-sm text-stone-600">{order.user?.email}</p>
                    <p className="text-sm text-stone-600">{order.user?.phone}</p>
                  </div>
                </div>
                {shippingAddress ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-stone-400 mt-0.5" />
                    <div className="text-sm text-stone-600">
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
            <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-stone-950">Order Summary</h2>
            </div>
            <div className="px-6 py-5 sm:px-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
