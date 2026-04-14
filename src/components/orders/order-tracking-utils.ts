import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const TRACKING_POLL_MS = 45_000;

export type TrackingStepDef = {
  key: string;
  title: string;
  subtitle: string;
};

export const TRACKING_STEPS: TrackingStepDef[] = [
  {
    key: "confirmed",
    title: "Order confirmed",
    subtitle: "We’ve received your payment and your order is in our system.",
  },
  {
    key: "preparing",
    title: "Preparing your order",
    subtitle: "Quality check and careful packaging for your pieces.",
  },
  {
    key: "shipped",
    title: "Shipped",
    subtitle: "On its way with insured delivery.",
  },
  {
    key: "delivered",
    title: "Delivered",
    subtitle: "Your order has reached you. Enjoy!",
  },
];

/**
 * Rank -1 = no fulfilment timeline yet (unpaid / cancelled). 1–4 = highest completed
 * stage; current step is at index === rank (until rank 4 = all done).
 */
export function getTrackingRank(
  status: OrderStatus,
  paymentStatus: PaymentStatus,
): number {
  if (paymentStatus !== "PAID") {
    return -1;
  }

  if (status === "CANCELLED") {
    return -1;
  }

  if (status === "PENDING" || status === "CONFIRMED") {
    return 1;
  }

  if (status === "PROCESSING") {
    return 2;
  }

  if (status === "SHIPPED") {
    return 3;
  }

  if (status === "DELIVERED") {
    return 4;
  }

  return -1;
}

export function stepVisualState(
  stepIndex: number,
  rank: number,
): "done" | "current" | "upcoming" {
  if (rank < 0) {
    return "upcoming";
  }

  if (rank >= 4) {
    return "done";
  }

  if (stepIndex < rank) {
    return "done";
  }

  if (stepIndex === rank) {
    return "current";
  }

  return "upcoming";
}
