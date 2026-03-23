import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gem,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import type { ShopPageRecord } from "@/lib/storefront";

type CatalogPageProps = {
  page: ShopPageRecord;
  selectedSubcategory?: string;
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const servicePillars = [
  {
    title: "Certified Craft",
    description: "Carefully finished jewellery with quality-led detailing.",
    icon: ShieldCheck,
  },
  {
    title: "Style Guidance",
    description: "Signature edits curated for gifting, layering, and occasion looks.",
    icon: Sparkles,
  },
  {
    title: "Secure Delivery",
    description: "Protected packaging and dependable delivery for every order.",
    icon: Truck,
  },
];

function normalizeSubLabel(value: string) {
  return value
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CatalogPage({ page, selectedSubcategory }: CatalogPageProps) {
  const subLabel = selectedSubcategory
    ? normalizeSubLabel(selectedSubcategory)
    : null;
  const subQuery = selectedSubcategory?.toLowerCase() ?? "";
  const filteredFeatures = subQuery
    ? page.features.filter((feature) =>
        feature.title.toLowerCase().includes(subQuery),
      )
    : page.features;
  const filteredProducts = subQuery
    ? page.products.filter((product) =>
        product.name.toLowerCase().includes(subQuery),
      )
    : page.products;
  const displayedFeatures =
    filteredFeatures.length > 0 ? filteredFeatures : page.features;
  const displayedProducts =
    filteredProducts.length > 0 ? filteredProducts : page.products;
  const noStrongMatch =
    Boolean(subQuery) &&
    filteredFeatures.length === 0 &&
    filteredProducts.length === 0;

  return (
    <main
      className="pb-24"
      style={{
        backgroundImage: "linear-gradient(180deg, #fffaf4 0%, #ffffff 44%, #f7efe6 100%)",
      }}
    >
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="luxury-shell">
          <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="transition hover:text-stone-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop/jewellery" className="transition hover:text-stone-900">
              Shop
            </Link>
            <span>/</span>
            <span className="font-medium text-stone-900">{page.title}</span>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 luxury-shadow backdrop-blur">
            <div className="grid gap-8 p-4 lg:grid-cols-[1.05fr_0.95fr] lg:p-5">
              <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-stone-950">
                <Image
                  src={page.heroImageUrl ?? "/images/sbg-women.jpg"}
                  alt={page.heroTitle}
                  fill
                  priority
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(100deg, rgba(20, 17, 15, 0.82) 0%, rgba(20, 17, 15, 0.4) 48%, rgba(20, 17, 15, 0.15) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%)",
                  }}
                />
                <div className="relative flex h-full flex-col justify-between p-7 text-white sm:p-10">
                  <div>
                    {page.heroEyebrow ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] backdrop-blur">
                        <Gem className="size-4" />
                        {page.heroEyebrow}
                      </div>
                    ) : null}
                    <h1
                      className="mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      {page.heroTitle}
                    </h1>
                    {subLabel ? (
                      <div className="mt-4 inline-flex rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/95">
                        Subcategory: {subLabel}
                      </div>
                    ) : null}
                    <p className="mt-5 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
                      {page.heroDescription}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={page.heroCtaHref}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
                    >
                      {page.heroCtaLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="luxury-panel p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
                    Category Overview
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
                    {page.title}
                  </h2>
                  <p className="mt-3 text-base leading-8 text-[var(--luxury-muted)]">
                    {page.subtitle}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="luxury-panel p-5">
                    <p className="text-sm font-medium text-stone-500">Results</p>
                    <div className="mt-3 text-3xl font-semibold text-stone-950">
                      {displayedProducts.length.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="luxury-panel p-5">
                    <p className="text-sm font-medium text-stone-500">Highlights</p>
                    <div className="mt-3 text-3xl font-semibold text-stone-950">
                      {displayedFeatures.length}
                    </div>
                  </div>
                  <div className="luxury-panel p-5">
                    <p className="text-sm font-medium text-stone-500">Featured Picks</p>
                    <div className="mt-3 text-3xl font-semibold text-stone-950">
                      {displayedProducts.length}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-100"
                  style={{ boxShadow: "0 30px 90px -55px rgba(28, 25, 23, 0.92)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                    Styling Notes
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    Pair this edit with layering-friendly essentials, gifting-ready
                    pieces, and signature styles designed to feel elevated from day
                    to occasion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section pt-10">
        <div className="luxury-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
                Shop Highlights
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Explore the key stories inside {page.title}.
              </h2>
            </div>
            <Link
              href={page.heroCtaHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900"
            >
              View full collection
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {displayedFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 luxury-shadow"
              >
                <div className="relative aspect-[0.9] overflow-hidden">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3
                    className="text-2xl text-stone-950"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {feature.title}
                  </h3>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                    Explore
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section pt-0">
        <div className="luxury-shell">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
                Featured Products
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Signature pieces selected for this category.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">
              Pricing, imagery, and merchandising copy are powered from the
              category record so each collection can be updated independently.
            </p>
          </div>

          {noStrongMatch ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Showing closest matches for <span className="font-semibold">{subLabel}</span>.
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayedProducts.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="block group overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 luxury-shadow transition hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className="relative aspect-[1.08] overflow-hidden"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #f8f1e9 0%, #fffdf9 100%)",
                  }}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 20% 20%, rgba(138, 103, 56, 0.16), transparent 34%), radial-gradient(circle at 80% 40%, rgba(217, 183, 122, 0.28), transparent 32%)",
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.18) 100%)",
                    }}
                  />
                  {product.badge ? (
                    <div className="absolute left-4 top-4 rounded-full bg-[#832729] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                      {product.badge}
                    </div>
                  ) : null}
                </div>
                <div className="p-6 flex flex-col h-[180px] justify-between">
                  <div>
                    <h3
                      className="text-lg font-serif font-medium leading-snug text-gray-900 group-hover:text-[#832729] transition-colors line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="text-xl font-serif font-medium text-[#832729]">
                        {formatINR(product.price)}
                      </div>
                      {product.lowStockText ? (
                        <span className="rounded bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                          {product.lowStockText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#832729]">
                      View Details
                    </span>
                    <ArrowRight className="size-4 text-[#832729] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section pt-0">
        <div className="luxury-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {servicePillars.map((item) => (
              <div key={item.title} className="luxury-panel p-6 luxury-shadow">
                <item.icon className="size-5 text-[var(--luxury-gold-deep)]" />
                <h3 className="mt-4 text-lg font-semibold text-stone-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
