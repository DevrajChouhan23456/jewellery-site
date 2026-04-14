"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { type FormEvent, useState, useSyncExternalStore } from "react";
import { Heart, Sparkles, Store } from "lucide-react";

import { useSiteIdentity } from "@/components/site-identity-provider";
import { useCartStore } from "@/lib/store";
import CartButton from "./navbar/CartButton";
import LogoSection from "./navbar/LogoSection";
import NavLinks from "./navbar/NavLinks";
import SearchBar from "./navbar/SearchBar";
import ProfileMenu from "./navProfile";

type NavbarProps = {
  onLoginClick?: () => void;
};

const iconLinks = [
  {
    href: "/shop/thejoydressing",
    label: "Style edits",
    icon: Sparkles,
  },
  {
    href: "/contact",
    label: "Help and support",
    icon: Store,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
] as const;

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const [query, setQuery] = useState("");
  const { data: session } = useSession();
  const { siteIdentity } = useSiteIdentity();
  const { openCart, getUniqueItemsCount } = useCartStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <LogoSection
            logoUrl={siteIdentity.logoUrl}
            siteName={siteIdentity.siteName}
            shortName={siteIdentity.shortName}
            tagline={siteIdentity.tagline}
          />

          <SearchBar
            variant="desktop"
            query={query}
            onQueryChange={setQuery}
            onSubmit={onSubmitSearch}
            placeholder="Search artificial jewellery"
          />

          <div className="flex items-center gap-5 text-[#832729]">
            {iconLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="hidden flex-col items-center gap-1 transition hover:opacity-80 md:flex"
              >
                <item.icon className="size-5 stroke-[1.5]" />
              </Link>
            ))}

            {session ? (
              <ProfileMenu />
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="flex flex-col items-center gap-1 transition hover:opacity-80"
              >
                <span className="text-sm font-medium">Login</span>
              </button>
            )}

            <CartButton
              onClick={openCart}
              count={getUniqueItemsCount()}
              showCount={mounted}
            />

            <NavLinks
              mode="mobile"
              query={query}
              onQueryChange={setQuery}
              onSubmitSearch={onSubmitSearch}
              onLoginClick={onLoginClick}
            />
          </div>
        </div>
      </div>

      <NavLinks mode="desktop" />
    </header>
  );
};

export default Navbar;
