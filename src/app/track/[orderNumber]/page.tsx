import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentCustomerUserId } from "@/lib/customer-session";
import { getCurrentUserOrderByOrderNumber } from "@/lib/account";
import { serializeOrderForTracking } from "@/server/orders/tracking-serializer";
import { OrderTrackPageClient } from "@/components/orders/OrderTrackPageClient";

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/track/${orderNumber}`)}`);
  }

  const order = await getCurrentUserOrderByOrderNumber(orderNumber);

  if (!order) {
    return (
      <main className="min-h-screen bg-luxury-ivory py-12 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
        <div className="luxury-shell max-w-lg text-center">
          <h1 className="text-2xl font-semibold">Order not found</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            We couldn’t find this order on your account. Check the order number
            or open it from My Orders.
          </p>
          <Link
            href="/account/orders"
            className="mt-6 inline-flex rounded-full bg-[#7a1f24] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#64181d]"
          >
            My orders
          </Link>
        </div>
      </main>
    );
  }

  const initial = serializeOrderForTracking(order);

  return (
    <main className="min-h-screen bg-luxury-ivory py-10 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      <div className="luxury-shell max-w-xl">
        <OrderTrackPageClient orderNumber={orderNumber} initialOrder={initial} />
      </div>
    </main>
  );
}
