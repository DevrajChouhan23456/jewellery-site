"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Menu, User } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import SearchBar from "./SearchBar";
import {
  categories,
  categoryHrefByLabel,
  megaMenuData,
} from "./navbar-data";

type DesktopNavLinksProps = {
  mode: "desktop";
};

type MobileNavLinksProps = {
  mode: "mobile";
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: (event: FormEvent<HTMLFormElement>) => void;
  onLoginClick?: () => void;
};

type NavLinksProps = DesktopNavLinksProps | MobileNavLinksProps;

const DesktopNavLinks = () => {
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [allowHoverMega, setAllowHoverMega] = useState(false);
  const closeMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateInteractionMode = () => {
      setAllowHoverMega(window.innerWidth >= 1280);
    };

    updateInteractionMode();
    window.addEventListener("resize", updateInteractionMode);

    return () => {
      window.removeEventListener("resize", updateInteractionMode);

      if (closeMenuTimer.current) {
        clearTimeout(closeMenuTimer.current);
      }
    };
  }, []);

  const openMegaMenu = (label: string) => {
    if (closeMenuTimer.current) {
      clearTimeout(closeMenuTimer.current);
    }

    setActiveMegaMenu(label);
  };

  const closeMegaMenu = () => {
    closeMenuTimer.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 120);
  };

  const getEntryHref = (categoryLabel: string, entry: string) => {
    const base = categoryHrefByLabel[categoryLabel] ?? "/shop/jewellery";

    return `${base}?sub=${encodeURIComponent(entry.toLowerCase())}`;
  };

  return (
    <div className="relative hidden md:block border-t border-gray-100 bg-white">
      <div
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        onMouseLeave={closeMegaMenu}
      >
        <div className="flex h-12 items-center justify-center gap-8 lg:gap-10 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`group flex items-center gap-2 border-b-2 px-1 pt-0.5 text-sm font-medium transition-colors ${
                activeMegaMenu === item.label
                  ? "border-[#832729] text-[#832729]"
                  : "border-transparent text-gray-700 hover:text-[#832729]"
              }`}
              onMouseEnter={() => {
                if (allowHoverMega) {
                  openMegaMenu(item.label);
                }
              }}
              onClick={() => {
                if (allowHoverMega) {
                  openMegaMenu(item.label);
                  return;
                }

                setActiveMegaMenu((current) =>
                  current === item.label ? null : item.label,
                );
              }}
            >
              <item.icon className="size-[18px] opacity-70 group-hover:opacity-100 stroke-[1.5]" />
              <span className="tracking-wide uppercase text-[11px] font-semibold">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeMegaMenu ? (
        <div
          className="absolute left-0 right-0 z-60 border-y border-gray-200 bg-white/95 shadow-[0_22px_38px_-26px_rgba(17,24,39,0.55)] backdrop-blur"
          onMouseEnter={() => openMegaMenu(activeMegaMenu)}
          onMouseLeave={closeMegaMenu}
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-[190px_1fr_250px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
            <aside className="rounded-xl border border-[#eadedf] bg-[#faf5f6] p-3">
              <ul className="space-y-1.5">
                {megaMenuData[activeMegaMenu]?.filters.map((filter, index) => (
                  <li
                    key={filter}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      index === 0
                        ? "bg-white font-semibold text-[#3c2224] shadow-sm"
                        : "text-[#4f4142] hover:bg-white"
                    }`}
                  >
                    {filter}
                  </li>
                ))}
              </ul>
            </aside>

            <section className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-white">
              {megaMenuData[activeMegaMenu]?.groups.map((group, index) => (
                <div
                  key={`${activeMegaMenu}-group-${index}`}
                  className="space-y-1 px-5 py-4"
                >
                  {group.map((entry) => (
                    <Link
                      key={entry}
                      href={getEntryHref(activeMegaMenu, entry)}
                      className="block rounded-md px-2 py-1.5 text-sm text-[#3b2a2b] hover:bg-[#fbf6f1] hover:text-[#832729]"
                    >
                      {entry}
                    </Link>
                  ))}
                </div>
              ))}
            </section>

            <aside className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-[#ede4d7] bg-linear-to-br from-[#f7efe3] via-[#f3e0c6] to-[#d2b38e] p-4 text-[#2e1e1f]">
                <div className="mb-10 max-w-[180px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6d4e33]">
                    Featured
                  </p>
                  <h3 className="mt-1 text-lg font-semibold leading-tight">
                    {megaMenuData[activeMegaMenu]?.promo.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#5a4a3e]">
                    {megaMenuData[activeMegaMenu]?.promo.subtitle}
                  </p>
                </div>
                <Link
                  href={categoryHrefByLabel[activeMegaMenu] ?? "/shop/jewellery"}
                  className="inline-flex items-center text-sm font-semibold text-[#832729] underline underline-offset-4"
                >
                  {megaMenuData[activeMegaMenu]?.promo.cta}
                </Link>
              </div>
            </aside>
          </div>

          <div className="border-t border-gray-200 bg-[#fbf7f2]">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <p className="text-sm font-medium text-[#3b2a2b]">
                {megaMenuData[activeMegaMenu]?.ribbon}
              </p>
              <Link
                href={categoryHrefByLabel[activeMegaMenu] ?? "/shop/jewellery"}
                className="inline-flex rounded-full bg-[#832729] px-6 py-2 text-sm font-semibold text-white hover:bg-[#6f2021]"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MobileNavLinks = ({
  query,
  onQueryChange,
  onSubmitSearch,
  onLoginClick,
}: MobileNavLinksProps) => (
  <div className="md:hidden flex items-center ml-2">
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-1">
          <Menu className="size-6 stroke-[1.5]" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-96 bg-white">
        <div className="flex flex-col gap-4 mt-6">
          <SearchBar
            variant="mobile"
            query={query}
            onQueryChange={onQueryChange}
            onSubmit={onSubmitSearch}
            placeholder="Search..."
          />

          <nav className="flex flex-col gap-1">
            {onLoginClick ? (
              <button
                onClick={onLoginClick}
                className="mb-1 flex items-center gap-3 rounded-lg border border-[#eadedf] bg-[#faf5f6] px-3 py-3 text-sm font-medium text-[#832729] text-left"
              >
                <User className="size-5 opacity-80" />
                <span>My Account</span>
              </button>
            ) : (
              <Link
                href="/account/login"
                className="mb-1 flex items-center gap-3 rounded-lg border border-[#eadedf] bg-[#faf5f6] px-3 py-3 text-sm font-medium text-[#832729]"
              >
                <User className="size-5 opacity-80" />
                <span>My Account</span>
              </Link>
            )}

            {categories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#832729]"
              >
                <item.icon className="size-5 opacity-70" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  </div>
);

const NavLinks = (props: NavLinksProps) => {
  if (props.mode === "mobile") {
    return <MobileNavLinks {...props} />;
  }

  return <DesktopNavLinks />;
};

export default NavLinks;
