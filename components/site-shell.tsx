"use client";

import { useState } from "react";
import Navbar from "./navbar";
import LoginModal from "./auth/loginModal";
import CartDrawer from "./cart-drawer";

export default function SiteShell({ children }: any) {
  const [open, setOpen] = useState(false);

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
