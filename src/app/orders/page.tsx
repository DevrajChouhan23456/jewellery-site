import { redirect } from "next/navigation";

/**
 * Legacy /orders URL from older nav — real page lives under /account/orders.
 */
export default function OrdersRedirectPage() {
  redirect("/account/orders");
}
