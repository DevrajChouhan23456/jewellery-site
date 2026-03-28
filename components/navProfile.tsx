"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) {
    return null;
  }

  const displayName = session.user?.name || session.user?.email || session.user?.phone || "User";

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold">
          {displayName[0]?.toUpperCase() || "U"}
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl bg-white p-3 shadow-xl">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="mb-2 text-xs text-gray-500">
            {session.user?.email || session.user?.phone || "Signed in"}
          </p>

          <hr className="my-2" />

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block w-full rounded py-2 text-left hover:bg-gray-100"
          >
            My Account
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="block w-full rounded py-2 text-left hover:bg-gray-100"
          >
            Wishlist
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full rounded py-2 text-left text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
