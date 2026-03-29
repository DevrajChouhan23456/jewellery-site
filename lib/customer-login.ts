"use client";

export const OPEN_CUSTOMER_LOGIN_EVENT = "customer-login:open";

export function openCustomerLogin() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OPEN_CUSTOMER_LOGIN_EVENT));
}
