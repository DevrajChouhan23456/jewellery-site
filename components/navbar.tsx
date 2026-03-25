"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock3,
  Diamond,
  Gift,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  Camera,
  Mic,
  Sparkles,
  CircleDollarSign,
  Sun,
  Layers,
  HeartHandshake,
  Ear,
  Circle,
  LogOut,
  MessageSquare,
  WalletCards,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useCartStore } from "@/lib/store";
import AccountDropdown from "./accountDropdown";

const Navbar = () => {
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.avif");
  const [query, setQuery] = useState("");
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [allowHoverMega, setAllowHoverMega] = useState(false);
  const closeMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeAccountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { openCart, getUniqueItemsCount } = useCartStore();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    const updateInteractionMode = () => {
      setAllowHoverMega(window.innerWidth >= 1280);
    };
    updateInteractionMode();
    window.addEventListener("resize", updateInteractionMode);
    return () => {
      window.removeEventListener("resize", updateInteractionMode);
      if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
      if (closeAccountTimer.current) clearTimeout(closeAccountTimer.current);
    };
  }, []);

  const categories = useMemo(
    () => [
      { label: "All Jewellery", href: "/shop/jewellery", icon: Sparkles },
      { label: "Gold", href: "/shop/gold", icon: CircleDollarSign },
      { label: "Diamond", href: "/shop/diamond", icon: Diamond },
      { label: "Earrings", href: "/shop/earrings", icon: Ear },
      { label: "Rings", href: "/shop/rings", icon: Circle },
      { label: "Daily Wear", href: "/shop/glamdays", icon: Sun },
      { label: "Collections", href: "/shop/thejoydressing", icon: Layers },
      { label: "Wedding", href: "/shop/jewellery", icon: HeartHandshake },
      { label: "Gifting", href: "/shop/gifting", icon: Gift },
      { label: "More", href: "/shop/jewellery", icon: Menu },
    ],
    []
  );

  const megaMenuData = useMemo(
    () =>
      ({
        "All Jewellery": {
          filters: ["Category", "Price", "Occasion", "Gender", "Metal"],
          groups: [
            ["All Jewellery", "Earrings", "Pendants", "Finger Rings"],
            ["Mangalsutra", "Chains", "Nose Pin", "Necklaces"],
            ["Necklace Set", "Bangles", "Bracelets", "Pendants & Earring Set"],
          ],
          promo: {
            title: "Elan - My World. My Story.",
            subtitle: "Jewellery for every moment, crafted to shine.",
            cta: "Explore now",
          },
          ribbon: "Jewellery for Every Moment - See It All Here!",
        },
        Gold: {
          filters: ["Category", "Price", "Occasion", "Gold Coin", "Men", "Metal"],
          groups: [
            ["All Gold", "Gold Earrings", "Gold Rings", "Gold Nose Pins"],
            ["Gold Bangles", "Gold Chains", "Gold Engagement Rings", "Gold Kadas"],
            ["Gold Bracelets", "Gold Pendants", "Gold Necklaces", "Gold Mangalsutras"],
          ],
          promo: {
            title: "Intricately handcrafted",
            subtitle: "Heritage-inspired pieces for modern elegance.",
            cta: "Explore now",
          },
          ribbon: "From Classic to Contemporary",
        },
        Diamond: {
          filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
          groups: [
            ["All Diamond", "Diamond Earrings", "Diamond Rings", "Diamond Nose Pins"],
            ["Diamond Bracelets", "Diamond Chains", "Diamond Pendants", "Diamond Bangles"],
            ["Diamond Necklaces", "Diamond Sets", "Solitaires", "Wedding Diamonds"],
          ],
          promo: {
            title: "Timeless brilliance",
            subtitle: "Signature diamond styles made to celebrate you.",
            cta: "Explore now",
          },
          ribbon: "Sparkle in every design",
        },
        Earrings: {
          filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
          groups: [
            ["All Earrings", "Studs", "Hoops", "Drops"],
            ["Chandbalis", "Jhumkas", "Daily Wear", "Office Wear"],
            ["Party Edit", "Bridal Edit", "Solitaire Earrings", "Kids Earrings"],
          ],
          promo: {
            title: "Find your perfect pair",
            subtitle: "From subtle studs to statement silhouettes.",
            cta: "Shop now",
          },
          ribbon: "Ear candy for every style",
        },
        Rings: {
          filters: ["Category", "Price", "Occasion", "Gender", "Metal & Stones"],
          groups: [
            ["All Rings", "Casual Rings", "Couple Rings", "Diamond Engagement Rings"],
            ["Engagement Rings", "Gold Engagement Rings", "Men's Rings", "Platinum Rings"],
            ["Solitaire Rings", "Wedding Bands", "Stacking Rings", "Cocktail Rings"],
          ],
          promo: {
            title: "A symbol of commitment",
            subtitle: "Celebrate love and milestones with a ring that speaks.",
            cta: "Shop now",
          },
          ribbon: "Celebrate love & milestones",
        },
        "Daily Wear": {
          filters: ["Category", "Price", "Occasion", "Gender", "Metal"],
          groups: [
            ["All Daily Wear", "Pendants", "Rings", "Earrings"],
            ["Chains", "Bracelets", "Necklaces", "Office Wear"],
            ["Lightweight Gold", "Minimal Diamond", "Everyday Classics", "Gift Picks"],
          ],
          promo: {
            title: "Style, every day",
            subtitle: "Light, elegant and effortless pieces for daily looks.",
            cta: "Explore now",
          },
          ribbon: "Daily looks that always shine",
        },
        Collections: {
          filters: ["Category", "New Arrivals", "Price", "Occasion", "Theme"],
          groups: [
            ["All Collections", "Bridal Edit", "Festive Edit", "Office Edit"],
            ["Statement Collection", "Minimal Collection", "Temple Collection", "Classic Gold"],
            ["Contemporary Diamond", "Limited Edition", "Seasonal Drops", "Best Sellers"],
          ],
          promo: {
            title: "Curated stories in gold",
            subtitle: "Exclusive edits inspired by moments and moods.",
            cta: "View all",
          },
          ribbon: "Curated collections for every story",
        },
        Wedding: {
          filters: ["Category", "Bridal Sets", "Price", "Occasion", "Metal"],
          groups: [
            ["All Wedding", "Bridal Necklaces", "Wedding Rings", "Wedding Earrings"],
            ["Mangalsutra", "Bridal Bangles", "Temple Jewellery", "Heirloom Edit"],
            ["For Bride", "For Groom", "Family Gifting", "Ceremony Essentials"],
          ],
          promo: {
            title: "Made for your big day",
            subtitle: "Celebrate your journey with timeless wedding jewellery.",
            cta: "Explore now",
          },
          ribbon: "Bridal jewellery crafted with love",
        },
        Gifting: {
          filters: ["Category", "Price", "Recipient", "Occasion", "Metal"],
          groups: [
            ["All Gifting", "For Her", "For Him", "For Kids"],
            ["Birthday Gifts", "Anniversary Gifts", "Wedding Gifts", "Festive Gifts"],
            ["Under 10k", "Under 25k", "Premium Gifts", "Gift Cards"],
          ],
          promo: {
            title: "Gift unforgettable sparkle",
            subtitle: "Thoughtful jewellery picks for every celebration.",
            cta: "Explore now",
          },
          ribbon: "Gift moments that last forever",
        },
        More: {
          filters: ["Highlights", "Shop by", "Help", "Services", "About"],
          groups: [
            ["New Arrivals", "Bestsellers", "Store Locator", "Book Appointment"],
            ["Try at Home", "Exchange Policy", "Track Order", "Customer Support"],
            ["About Us", "Care Guide", "FAQs", "Blogs"],
          ],
          promo: {
            title: "Discover more with us",
            subtitle: "Services and stories beyond shopping.",
            cta: "Know more",
          },
          ribbon: "Everything else you need",
        },
      }) as Record<
        string,
        {
          filters: string[];
          groups: string[][];
          promo: { title: string; subtitle: string; cta: string };
          ribbon: string;
        }
      >,
    [],
  );

  const openMegaMenu = (label: string) => {
    if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
    setActiveMegaMenu(label);
  };

  const closeMegaMenu = () => {
    closeMenuTimer.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 120);
  };

  const openAccountMenu = () => {
    if (closeAccountTimer.current) clearTimeout(closeAccountTimer.current);
    setAccountOpen(true);
  };

  const closeAccountMenu = () => {
    closeAccountTimer.current = setTimeout(() => {
      setAccountOpen(false);
    }, 120);
  };

  const onSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const categoryHrefByLabel = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.label, item.href])) as Record<string, string>,
    [categories],
  );

  const getEntryHref = (categoryLabel: string, entry: string) => {
    const base = categoryHrefByLabel[categoryLabel] ?? "/shop/jewellery";
    return `${base}?sub=${encodeURIComponent(entry.toLowerCase())}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top row */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            {logoUrl ? (
              <div className="relative h-10 w-36 overflow-hidden">
                <Image src={logoUrl} alt="Tanishq" fill className="object-contain object-left" />
              </div>
            ) : (
              <div className="relative h-12 w-32 flex items-center justify-center">
                <span className="text-[#832729] font-serif text-2xl tracking-wider font-bold">
                  TANISHQ
                </span>
              </div>
            )}
          </Link>

          <form
            onSubmit={onSubmitSearch}
            className="hidden flex-1 max-w-[600px] md:block"
          >
            <div className="relative flex items-center w-full h-11 rounded-full border border-gray-300 bg-white px-4 hover:border-gray-400 transition-colors focus-within:border-[#832729] focus-within:ring-1 focus-within:ring-[#832729]">
              <Search className="size-4 text-gray-400 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for diamond jewellery"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <div className="flex items-center gap-3 text-gray-400">
                <Camera className="size-4 cursor-pointer hover:text-[#832729]" />
                <Mic className="size-4 cursor-pointer hover:text-[#832729]" />
              </div>
            </div>
          </form>

          <div className="flex items-center gap-5 text-[#832729]">
            <button className="hidden md:flex flex-col items-center gap-1 hover:opacity-80 transition">
              <Diamond className="size-5 stroke-[1.5]" />
            </button>
            <button className="hidden md:flex flex-col items-center gap-1 hover:opacity-80 transition">
              <Store className="size-5 stroke-[1.5]" />
            </button>
            <button className="hidden md:flex flex-col items-center gap-1 hover:opacity-80 transition">
              <Heart className="size-5 stroke-[1.5]" />
            </button>
            <AccountDropdown/>
            <button onClick={openCart} className="flex relative items-center justify-center hover:opacity-80 transition mt-[-4px]">
              <ShoppingBag className="size-5 stroke-[1.5]" />
              {mounted && getUniqueItemsCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#832729] text-[10px] font-bold text-white">
                  {getUniqueItemsCount()}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center ml-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-1">
                    <Menu className="size-6 stroke-[1.5]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-96 bg-white">
                  <div className="flex flex-col gap-4 mt-6">
                    <form onSubmit={onSubmitSearch}>
                      <div className="relative flex items-center h-10 rounded-full border border-gray-300 px-3">
                        <Search className="size-4 text-gray-400 mr-2" />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search..."
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </form>
                    <nav className="flex flex-col gap-1">
                      <Link
                        href="/account/login"
                        className="mb-1 flex items-center gap-3 rounded-lg border border-[#eadedf] bg-[#faf5f6] px-3 py-3 text-sm font-medium text-[#832729]"
                      >
                        <User className="size-5 opacity-80" />
                        <span>My Account</span>
                      </Link>
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
          </div>
        </div>
      </div>

      {/* Category row */}
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
                  if (allowHoverMega) openMegaMenu(item.label);
                }}
                onClick={() => {
                  if (allowHoverMega) {
                    openMegaMenu(item.label);
                    return;
                  }
                  setActiveMegaMenu((prev) => (prev === item.label ? null : item.label));
                }}
              >
                <item.icon className="size-[18px] opacity-70 group-hover:opacity-100 stroke-[1.5]" />
                <span className="tracking-wide uppercase text-[11px] font-semibold">{item.label}</span>
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
                  {megaMenuData[activeMegaMenu]?.filters.map((filter, idx) => (
                    <li
                      key={filter}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        idx === 0
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
                  <div key={`${activeMegaMenu}-group-${index}`} className="space-y-1 px-5 py-4">
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
    </header>
  );
};

export default Navbar;
