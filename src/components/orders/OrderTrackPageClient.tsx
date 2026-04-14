"use client";

import { useCallback, useEffect, useState } from "react";

import { GsapStaggerMount } from "@/components/motion/GsapStaggerMount";
import type { OrderTrackingPayload } from "@/server/orders/tracking-serializer";
import { OrderTrackingView } from "@/components/orders/OrderTrackingView";
import { TRACKING_POLL_MS } from "@/components/orders/order-tracking-utils";

export function OrderTrackPageClient({
  orderNumber,
  initialOrder,
}: {
  orderNumber: string;
  initialOrder: OrderTrackingPayload;
}) {
  const [order, setOrder] = useState<OrderTrackingPayload>(initialOrder);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 404) {
        setFetchError("This order is no longer available.");
        return;
      }

      if (!res.ok) {
        setFetchError("Could not refresh status. We’ll try again.");
        return;
      }

      const data = (await res.json()) as OrderTrackingPayload;
      setOrder(data);
      setLastSyncedAt(new Date());
      setFetchError(null);
    } catch {
      setFetchError("Network issue while updating. Retrying soon.");
    }
  }, [orderNumber]);

  useEffect(() => {
    const id = window.setInterval(refresh, TRACKING_POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <div>
      <GsapStaggerMount className="contents">
        {fetchError ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            {fetchError}
          </p>
        ) : null}
        <OrderTrackingView order={order} lastSyncedAt={lastSyncedAt} />
      </GsapStaggerMount>
    </div>
  );
}
