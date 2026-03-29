"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import LoginModal from "./auth/loginModal";
import CartDrawer from "./cart-drawer";
import { OPEN_CUSTOMER_LOGIN_EVENT } from "@/lib/customer-login";

export default function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => {
      setOpen(true);
    };

    window.addEventListener(OPEN_CUSTOMER_LOGIN_EVENT, handleOpenLogin);

    return () => {
      window.removeEventListener(OPEN_CUSTOMER_LOGIN_EVENT, handleOpenLogin);
    };
  }, []);

  return (
    <>
      {/* ✅ PASS DOWN */}
      <Navbar onLoginClick={() => setOpen(true)} />

      {/* ✅ MODAL CONTROLLED HERE */}
      <LoginModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <CartDrawer />

      <main>{children}</main>
    </>
  );
}
