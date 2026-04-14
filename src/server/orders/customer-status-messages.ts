import type { OrderStatus } from "@prisma/client";

export type CustomerStatusNotificationCopy = {
  label: string;
  detail: string;
  whatsappStatusLine: string;
};

export function getCustomerStatusNotificationCopy(
  status: OrderStatus,
): CustomerStatusNotificationCopy {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Your order is confirmed",
        detail:
          "We've received everything we need and your jewellery will move into preparation soon.",
        whatsappStatusLine: "Your order is confirmed.",
      };
    case "PROCESSING":
      return {
        label: "We're preparing your order",
        detail:
          "Your pieces are being carefully checked and packed for insured shipment.",
        whatsappStatusLine: "We're preparing your order for shipment.",
      };
    case "SHIPPED":
      return {
        label: "Your order has shipped",
        detail:
          "It's on the way. Use the link below to track delivery progress anytime.",
        whatsappStatusLine: "Your order has shipped.",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        detail:
          "Your order should be with you now. We hope you love it — contact us if anything isn't right.",
        whatsappStatusLine: "Your order has been delivered.",
      };
    case "CANCELLED":
      return {
        label: "Order cancelled",
        detail:
          "This order is no longer being fulfilled. If a payment was captured, our team will help with the next steps.",
        whatsappStatusLine: "Your order has been cancelled.",
      };
    case "PENDING":
    default:
      return {
        label: "Order status updated",
        detail:
          "Your order record was updated. Open tracking for the latest details.",
        whatsappStatusLine: "Your order status was updated.",
      };
  }
}
