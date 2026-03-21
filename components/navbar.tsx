"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Diamond,
  Gem,
  Gift,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
const Navbar = () => {
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.avif");
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/logo", { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { logoUrl?: string; logo?: { url?: string } }) => {
        const nextUrl = data?.logoUrl ?? data?.logo?.url;
        if (typeof nextUrl === "string" && nextUrl.length > 0) {
          setLogoUrl(nextUrl);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const router = useRouter();

  const handleAccountClick = () => {
    if (status === "loading") return; // wait until we know
    if (session) {
      router.push("/user/dashboard");
    } else {
      router.push("/user/login");
    }
  };

  const categories = useMemo(
    () => [
      { label: "All Jewellery", href: "/shop/jewellery", icon: Gem },
      { label: "Gold", href: "/shop/gold", icon: Store },
      { label: "Diamond", href: "/shop/diamond", icon: Diamond },
      { label: "Earrings", href: "/shop/earrings", icon: Gem },
      { label: "Rings", href: "/shop/rings", icon: Gem },
      { label: "Daily Wear", href: "/shop/glamdays", icon: Gem },
      { label: "Collections", href: "/shop/thejoydressing", icon: Gem },
      { label: "Wedding", href: "/shop/jewellery", icon: Gem },
      { label: "Gifting", href: "/shop/gifting", icon: Gift },
      { label: "More", href: "/shop/jewellery", icon: ChevronDown },
    ],
    []
  );

  const onSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    // Keep it functional without assuming a search route exists.
    // If you later add a search page, replace this with `router.push(...)`.
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-950/70">
      {/* Top row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-full border border-black/10 bg-white object-cover dark:border-white/10"
            />
            <span className="hidden text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:inline">
              Tanishq
            </span>
          </Link>

          <form
            onSubmit={onSubmitSearch}
            className="mx-auto hidden w-full max-w-2xl md:block"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for engagement rings"
                className="h-10 rounded-full bg-white/70 pl-9 pr-3 text-sm shadow-sm ring-1 ring-black/5 focus-visible:ring-black/10 dark:bg-neutral-950/40 dark:ring-white/10 dark:focus-visible:ring-white/20"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full md:inline-flex"
              aria-label="Stores"
            >
              <Store className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full md:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAccountClick}
              className="hidden rounded-full md:inline-flex"
              aria-label="Account"
            >
              <User className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full md:inline-flex"
              aria-label="Bag"
            >
              <ShoppingBag className="size-5" />
            </Button>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-96">
                  <div className="flex items-center gap-3 py-2">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-black/10 object-cover dark:border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        Tanishq
                      </div>
                      <button
                        type="button"
                        onClick={handleAccountClick}
                        className="text-xs text-slate-600 hover:underline dark:text-slate-300"
                      >
                        {session ? "Go to dashboard" : "Sign in"}
                      </button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <form onSubmit={onSubmitSearch}>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search…"
                        className="h-10 pl-9"
                      />
                    </div>
                  </form>
                  <Separator className="my-3" />
                  <nav className="grid gap-1">
                    {categories.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                      >
                        <item.icon className="size-4 text-slate-600 dark:text-slate-300" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Category row */}
      <div className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center gap-3 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                )}
              >
                <item.icon className="size-4 opacity-80 transition group-hover:opacity-100" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
