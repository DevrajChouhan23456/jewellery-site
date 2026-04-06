"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/magicui/avatar";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, Package, Settings2, UserRound } from "lucide-react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) {
    return null;
  }

  const displayName = session.user?.name || session.user?.email || session.user?.phone || "User";
  const secondary = session.user?.email || session.user?.phone || "Signed in";
  const initial = displayName[0]?.toUpperCase() || "U";
  const image = (session.user as { image?: string } | undefined)?.image;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-[#832729] hover:bg-black/5"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar className="size-10 ring-1 ring-black/5">
          {image ? (
            <AvatarImage src={image} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-[#832729]/15 to-[#832729]/5 text-sm font-semibold text-[#832729]">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl bg-white/95 p-2 text-sm shadow-xl ring-1 ring-black/5 backdrop-blur">
          <MagicCard
            className="rounded-lg"
            gradientFrom="#832729"
            gradientTo="#FE8BBB"
            gradientOpacity={0.08}
            gradientSize={180}
          >
            <div className="relative rounded-lg border border-white/60 bg-gradient-to-b from-white/90 to-white/80 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="size-10 ring-1 ring-black/10">
                  {image ? (
                    <AvatarImage src={image} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-[#832729]/20 to-[#832729]/5 text-sm font-semibold text-[#832729]">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-gray-900">{displayName}</p>
                  <p className="truncate text-[11px] text-gray-500">{secondary}</p>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-gray-800 transition hover:bg-gray-50"
                >
                  <UserRound className="size-4 text-[#832729]" />
                  <span>My account</span>
                </Link>

                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-gray-800 transition hover:bg-gray-50"
                >
                  <Package className="size-4 text-[#832729]" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-gray-800 transition hover:bg-gray-50"
                >
                  <Heart className="size-4 text-[#832729]" />
                  <span>Wishlist</span>
                </Link>

                <Link
                  href="/account/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-gray-800 transition hover:bg-gray-50"
                >
                  <Settings2 className="size-4 text-[#832729]" />
                  <span>Account settings</span>
                </Link>
              </div>

              <Separator className="my-2" />

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
            </div>
          </MagicCard>
        </div>
      ) : null}
    </div>
  );
}
