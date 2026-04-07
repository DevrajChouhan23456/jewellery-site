import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, Package, Truck } from "lucide-react";

import { getAdminOrderById } from "@/server/services/admin/orders";
import { Badge } from "@/components/ui/badge";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100); // Assuming amount is in paisa
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="size-5" />;
    case "CONFIRMED":
      return <CheckCircle className="size-5" />;
    case "PROCESSING":
      return <Package className="size-5" />;
    case "SHIPPED":
      return <Truck className="size-5" />;
    case "DELIVERED":
      return <CheckCircle className="size-5" />;
    case "CANCELLED":
      return <Clock className="size-5" />;
    default:
      return <Clock className="size-5" />;
  }
}

function getStatusStep(status: string) {
  const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  return steps.indexOf(status);
}

interface OrderTrackingPageProps {
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

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return (
      <main className="min-h-screen bg-stone-50 py-10 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-stone-950">Order not found</h1>
            <p className="mt-2 text-stone-600">Please check your order ID and try again.</p>
            <Link href="/" className="mt-4 inline-block text-[var(--luxury-gold-deep)]">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = getStatusStep(order.status);
  const shippingAddress = getShippingAddress(order.shippingAddress);
  const steps = [
    { status: "PENDING", label: "Order Placed", description: "Your order has been received" },
    { status: "CONFIRMED", label: "Confirmed", description: "Your order has been confirmed" },
    { status: "PROCESSING", label: "Processing", description: "Your order is being prepared" },
    { status: "SHIPPED", label: "Shipped", description: "Your order has been shipped" },
    { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-950"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Status & Timeline */}
          <div className="lg:col-span-2">
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
              <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-950">
                      Order {order.orderNumber}
                    </h1>
                    <p className="mt-1 text-stone-600">Track your order status</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 py-8 sm:px-8">
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className={`flex size-10 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : isCurrent
                            ? "border-blue-500 bg-blue-50 text-blue-500"
                            : "border-stone-300 bg-stone-50 text-stone-400"
                        }`}>
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            isCompleted ? "text-stone-950" : "text-stone-600"
                          }`}>
                            {step.label}
                          </h3>
                          <p className="text-sm text-stone-600">{step.description}</p>
                          {isCurrent && (
                            <p className="mt-1 text-xs text-stone-500">
                              {formatDate(order.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
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
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div>
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
              <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
                <h2 className="text-xl font-semibold text-stone-950">Order Summary</h2>
              </div>
              <div className="px-6 py-5 sm:px-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Order Date</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Items</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 space-y-2">
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
              </div>
            </section>

            {/* Shipping Address */}
            {shippingAddress ? (
              <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
                <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
                  <h2 className="text-xl font-semibold text-stone-950">Shipping Address</h2>
                </div>
                <div className="px-6 py-5 sm:px-8">
                  <div className="text-sm text-stone-600">
                    <p className="font-medium text-stone-950">{order.user?.name}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    <p className="mt-2">{order.user?.phone}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
