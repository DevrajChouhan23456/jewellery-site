"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ChevronDown, Heart, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  badge?: string;
  lowStockText?: string;
};

type CatalogPageProps = {
  title: string;
  resultCount?: number;
  products?: CatalogProduct[];
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("₹", "₹ ");
}

const demoProducts: CatalogProduct[] = [
  {
    id: "p1",
    name: "Everyday Charm Diamond Stud Earrings",
    price: 105541,
    badge: "",
    lowStockText: "Only 1 left!",
  },
  {
    id: "p2",
    name: "Charming Paisley Pendant",
    price: 55772,
    badge: "EXPERT'S CHOICE",
    lowStockText: "Only 1 left!",
  },
  {
    id: "p3",
    name: "Classic Gold Earrings",
    price: 86437,
  },
  {
    id: "p4",
    name: "Minimal Gold Necklace",
    price: 124900,
  },
  {
    id: "p5",
    name: "Statement Diamond Ring",
    price: 210450,
  },
  {
    id: "p6",
    name: "Elegant Daily Wear Pendant",
    price: 48990,
  },
];

const chips = [
  "₹25,000 - ₹50,000",
  "Gifts For Him",
  "Women",
  "Gold Jewellery",
];

export function CatalogPage({ title, resultCount = 28627, products }: CatalogPageProps) {
  const [wishlisted, setWishlisted] = React.useState<Record<string, boolean>>(
    {},
  );
  const [sortOpen, setSortOpen] = React.useState(false);
  const list = products?.length ? products : demoProducts;

  return (
    <main className="bg-white pb-24 text-slate-900 dark:bg-neutral-950 dark:text-slate-50">
      {/* Top hero strip */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-6">
          {[
            { label: "14 Kt", tone: "from-stone-100 to-white" },
            { label: "18 Kt", tone: "from-amber-50 to-white" },
            { label: "22 Kt", tone: "from-yellow-50 to-white" },
          ].map((k) => (
            <div key={k.label} className="text-center">
              <div
                className={cn(
                  "relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br shadow-sm dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950",
                  k.tone,
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(122,31,36,0.12),transparent_60%)]" />
                <Image
                  src="/images/logo.avif"
                  alt=""
                  width={300}
                  height={300}
                  className="absolute inset-0 m-auto h-24 w-24 rounded-full opacity-15"
                />
              </div>
              <div className="mt-3 text-lg font-medium">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="text-slate-400">›</span>
          <span className="font-medium text-[#7a1f24]">{title}</span>
        </div>
      </section>

      {/* Results section */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_80px_-70px_rgba(2,6,23,0.35)] ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif text-3xl font-semibold tracking-tight">
                  {title}
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  ({resultCount} results)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-neutral-950 dark:hover:bg-white/5"
              >
                <SlidersHorizontal className="size-4 text-slate-600 dark:text-slate-300" />
                Filter
                <ChevronDown className="size-4 text-slate-500" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-neutral-950 dark:hover:bg-white/5"
                >
                  <span className="text-slate-500 dark:text-slate-300">
                    Sort By:
                  </span>
                  <span className="font-semibold">Best Matches</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-slate-500 transition-transform",
                      sortOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>
                {sortOpen ? (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-950">
                    {["Best Matches", "Price: Low to High", "Price: High to Low"].map(
                      (label) => (
                        <button
                          type="button"
                          key={label}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                          onClick={() => setSortOpen(false)}
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {chips.map((label) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-neutral-950 dark:hover:bg-white/5"
              >
                <span className="grid size-6 place-items-center rounded-full bg-[#f3e7e8] text-[#7a1f24]">
                  +
                </span>
                {label}
              </button>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-[#7a1f24] hover:underline"
            >
              +Show More
            </button>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => {
              const isWishlisted = !!wishlisted[p.id];
              return (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-950"
                >
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white dark:bg-neutral-950/70 dark:ring-white/10"
                    onClick={() =>
                      setWishlisted((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                    }
                  >
                    <Heart
                      className={cn(
                        "size-4",
                        isWishlisted
                          ? "fill-[#7a1f24] text-[#7a1f24]"
                          : "text-slate-500",
                      )}
                    />
                  </button>

                  {p.badge ? (
                    <div className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full bg-[#d2696f] px-3 py-1 text-xs font-semibold tracking-wide text-white">
                      {p.badge}
                    </div>
                  ) : null}

                  <div className="relative aspect-[4/3] w-full bg-[#f6f6f6] dark:bg-neutral-900">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(122,31,36,0.18),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(214,164,88,0.22),transparent_55%)]" />
                    )}
                  </div>

                  <div className="p-5">
                    <div className="font-serif text-xl font-semibold leading-snug">
                      {p.name}
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <div className="text-xl font-semibold tabular-nums">
                        {formatINR(p.price)}
                      </div>
                      {p.lowStockText ? (
                        <div className="text-sm font-medium text-[#7a1f24]">
                          {p.lowStockText}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating helpers (as in screenshot) */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <Button
          type="button"
          className="h-11 rounded-none bg-[#7a1f24] px-6 text-white hover:bg-[#6a1a1f]"
        >
          Anniversary Gift Finder
        </Button>
      </div>

      <div className="fixed bottom-8 left-1/2 z-40 hidden w-[620px] -translate-x-1/2 md:block">
        <div className="flex items-center justify-between rounded-full border border-[#d8b48a] bg-white px-3 py-2 shadow-lg">
          <div className="inline-flex items-center gap-3">
            <span className="rounded-full bg-[#d8b48a] px-3 py-1 text-xs font-semibold text-white">
              New
            </span>
            <span className="text-sm text-slate-800">
              Welcome back! Continue your wedding journey with us.
            </span>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-[#fff8f1] text-[#7a1f24]">
            →
          </span>
        </div>
      </div>
    </main>
  );
}

