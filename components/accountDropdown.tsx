"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Clock3,
  WalletCards,
  Store,
  MessageSquare,
  LogOut,
  User,
} from "lucide-react";

export default function AccountDropdown() {
  const { data: session } = useSession();

  return (
    <div className="mt-2 space-y-0.5">

      {session ? (
        <>
          {/* USER INFO */}
          <div className="px-3 py-2 text-sm text-gray-600 border-b mb-2">
            Hello, {session.user?.name || "User"}
          </div>

          <Link href="/account" className="menu-item">
            <Clock3 className="size-4" />
            Order History
          </Link>

          <Link href="/account" className="menu-item">
            <WalletCards className="size-4" />
            Gift Card Balance
          </Link>

          <Link href="/account" className="menu-item">
            <Store className="size-4" />
            Track Order
          </Link>

          <Link href="/contact" className="menu-item">
            <MessageSquare className="size-4" />
            Contact Us
          </Link>

          {/* 🔥 REAL LOGOUT */}
          <button
            onClick={() => signOut()}
            className="menu-item w-full text-left"
          >
            <LogOut className="size-4" />
            Log Out
          </button>
        </>
      ) : (
        <>
          {/* NOT LOGGED IN */}
          <Link href="/account/login" className="menu-item">
            <User className="size-4" />
            Login / Signup
          </Link>
        </>
      )}
    </div>
  );
}