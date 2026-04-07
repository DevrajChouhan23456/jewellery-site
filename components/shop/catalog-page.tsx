"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart, Users, Clock, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VariableRewardPopup, useVariableRewards } from "@/components/variable-reward-popup";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  slug?: string;
};

type CatalogFeature = {
  id: string;
  title: string;
  imageUrl?: string | null;
  href: string;
  order: number;
};

type CatalogPageData = {
  slug: string;
  title?: string | null;
  subtitle?: string | null;
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  heroImageUrl?: string | null;
  heroCtaLabel?: string | null;
  heroCtaHref?: string | null;
  resultCount?: number;
  features?: CatalogFeature[];
  products: CatalogProduct[];
};

type CatalogFilters = {
  page: number;
  sort: string;
  minPrice: string;
  maxPrice: string;
  materials: string[];
  categories: string[];
};

type CatalogPageProps = {
  page: CatalogPageData;
  selectedSubcategory?: string;
};

function formatINR(price: number) {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function getStableValue(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getProductSignals(product: CatalogProduct, index: number) {
  const seed = getStableValue(`${product.id}-${product.slug ?? "product"}-${index}`);

  return {
    showLowStock: seed % 5 === 0,
    lowStockCount: (seed % 5) + 1,
    showViewerCount: seed % 7 === 0,
    viewerCount: (seed % 20) + 5,
  };
}

export function CatalogPage({ page, selectedSubcategory }: CatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showPopup, currentDiscount, closePopup } = useVariableRewards();

  const [products, setProducts] = useState<CatalogProduct[]>(page.products || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<CatalogFilters>({
    page: 1,
    sort: searchParams.get("sort") || "latest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    materials:
      searchParams.get("materials")?.split(",").filter(Boolean) || [],
    categories: selectedSubcategory
      ? [selectedSubcategory]
      : searchParams.get("categories")?.split(",").filter(Boolean) || [],
  });

  const toggleFilter = (type: "materials" | "categories", value: string) => {
    setFilters((prev) => {
      const exists = prev[type].includes(value);

      return {
        ...prev,
        page: 1,
        [type]: exists
          ? prev[type].filter((item) => item !== value)
          : [...prev[type], value],
      };
    });
    setHasMore(true);
  };

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      sort: "latest",
      minPrice: "",
      maxPrice: "",
      materials: [],
      categories: [],
    });
    setHasMore(true);
  }, []);

  const activeFilterCount =
    filters.materials.length +
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const featureTiles =
    page.features && page.features.length > 0
      ? page.features
      : ["Earrings", "Pendants", "Rings", "Gifts"].map((item, index) => ({
          id: `fallback-feature-${index + 1}`,
          title: item,
          imageUrl: null,
          href: `/shop/${page.slug}`,
          order: index + 1,
        }));

  const hasActiveFetchFilters =
    filters.sort !== "latest" ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.materials.length > 0 ||
    filters.categories.length > 0;

  // 🔥 INFINITE SCROLL LOGIC
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = filters.page + 1;

    const params = new URLSearchParams();
    params.set("slug", page.slug);
    params.set("page", String(nextPage));
    params.set("sort", filters.sort);

    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.materials.length)
      params.set("materials", filters.materials.join(","));
    if (filters.categories.length)
      params.set("categories", filters.categories.join(","));

    try {
      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      const newProducts = data.products || [];

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setFilters((prev) => ({ ...prev, page: nextPage }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, loading, hasMore, page.slug]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreProducts, hasMore, loading]);

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    if (!hasActiveFetchFilters && page.products && page.products.length > 0) {
      setProducts(page.products);
      setHasMore(page.products.length >= 9);
      return;
    }

    async function fetchProducts() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("slug", page.slug);
      params.set("page", "1");
      params.set("sort", filters.sort);

      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.materials.length)
        params.set("materials", filters.materials.join(","));
      if (filters.categories.length)
        params.set("categories", filters.categories.join(","));

      try {
        const res = await fetch(`/api/products?${params.toString()}`, {
          cache: "no-store",
        });

        const data = await res.json();

        setProducts(data.products || []);
        setHasMore((data.products || []).length >= 9);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.materials,
    filters.categories,
    hasActiveFetchFilters,
    page.products,
    page.slug,
  ]);

  // 🔥 SYNC URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.materials.length)
      params.set("materials", filters.materials.join(","));
    if (filters.categories.length)
      params.set("categories", filters.categories.join(","));
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort) params.set("sort", filters.sort);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  return (
    <>
      <section className="relative mb-8 overflow-hidden border-b border-[#832729]/10 bg-linear-to-r from-[#fff8ef] via-[#fff4eb] to-[#ffe8e6] py-14">
        {page.heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={page.heroImageUrl}
              alt={page.heroTitle ?? `${page.slug} collection`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#fff9f1]/95 via-[#fff5ed]/88 to-[#2c160d]/78" />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#832729]/10 blur-3xl" />
          <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-[#fe8bbb]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#832729]/20 bg-white/70 px-3 py-1 text-xs font-medium text-[#832729]">
              <Sparkles className="size-3.5" />
              {page.heroEyebrow || "Curated for your style"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-stone-900 md:text-4xl">
              {page.heroTitle || `${page.title ?? page.slug} Collection`}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
              {page.heroDescription ||
                "Discover handcrafted pieces designed for everyday elegance and special occasions. Use filters to quickly find the perfect match by material, category, and price."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={page.heroCtaHref || `/shop/${page.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#832729] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6d2022]"
              >
                {page.heroCtaLabel || "Shop now"}
                <ArrowRight className="size-4" />
              </Link>
              {page.subtitle ? (
                <p className="text-sm text-stone-500">{page.subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {featureTiles.map((item) => (
              <MagicCard
                key={item.id}
                className="rounded-2xl"
                gradientFrom="#832729"
                gradientTo="#FE8BBB"
                gradientOpacity={0.08}
                gradientSize={180}
              >
                <Link
                  href={item.href}
                  className="block rounded-2xl border border-white/80 bg-white/85 p-4 text-center shadow-sm"
                >
                  <div className="relative mb-2 h-16 overflow-hidden rounded-xl bg-linear-to-br from-[#832729]/10 to-[#fe8bbb]/15">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-stone-800">{item.title}</p>
                </Link>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-4">
          
          {/* 🔥 FILTER SIDEBAR */}
          <div className="sticky top-24 hidden h-fit space-y-6 rounded-2xl border border-[#832729]/10 bg-white/90 p-6 shadow-sm backdrop-blur lg:block">
            <div className="flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 font-semibold text-stone-900">
                <SlidersHorizontal className="size-4 text-[#832729]" />
                Filters
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>

            {/* PRICE */}
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Price range</p>
              <input
                type="number"
                placeholder="Min"
                className="mb-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-[#832729]/40 focus:outline-none focus:ring-2 focus:ring-[#832729]/10"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minPrice: e.target.value, page: 1 }))
                }
                onBlur={() => setHasMore(true)}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-[#832729]/40 focus:outline-none focus:ring-2 focus:ring-[#832729]/10"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))
                }
                onBlur={() => setHasMore(true)}
              />
            </div>

            {/* MATERIAL */}
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Material</p>
              {["gold", "diamond", "silver"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleFilter("materials", item)}
                  className={`mb-2 mr-2 rounded-full border px-3 py-1 text-sm capitalize transition ${
                    filters.materials.includes(item)
                      ? "border-[#832729] bg-[#832729] text-white"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* CATEGORY */}
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Category</p>
              {["ring", "necklace", "bracelet"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleFilter("categories", item)}
                  className={`mb-2 mr-2 rounded-full border px-3 py-1 text-sm capitalize transition ${
                    filters.categories.includes(item)
                      ? "border-[#832729] bg-[#832729] text-white"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 🔥 PRODUCT AREA */}
          <div className="lg:col-span-3">

            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  {page.title ?? page.slug.replace(/-/g, " ")}
                </h2>
                {page.resultCount !== undefined ? (
                  <p className="mt-1 text-sm text-stone-500">
                    {page.resultCount} matching products
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="inline-flex lg:hidden"
                    >
                      <SlidersHorizontal className="size-4" />
                      Filters
                      {activeFilterCount > 0 ? (
                        <span className="rounded-full bg-[#832729] px-2 py-0.5 text-xs text-white">
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] overflow-y-auto p-5">
                    <SheetHeader className="mb-4 p-0">
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-[#832729]" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-700">Active filters</p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Clear all
                        </button>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-stone-700">Price range</p>
                        <input
                          type="number"
                          placeholder="Min"
                          className="mb-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-[#832729]/40 focus:outline-none focus:ring-2 focus:ring-[#832729]/10"
                          value={filters.minPrice}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, minPrice: e.target.value, page: 1 }))
                          }
                          onBlur={() => setHasMore(true)}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-[#832729]/40 focus:outline-none focus:ring-2 focus:ring-[#832729]/10"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))
                          }
                          onBlur={() => setHasMore(true)}
                        />
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-stone-700">Material</p>
                        {["gold", "diamond", "silver"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleFilter("materials", item)}
                            className={`mb-2 mr-2 rounded-full border px-3 py-1 text-sm capitalize transition ${
                              filters.materials.includes(item)
                                ? "border-[#832729] bg-[#832729] text-white"
                                : "border-stone-200 text-stone-700 hover:bg-stone-50"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-stone-700">Category</p>
                        {["ring", "necklace", "bracelet"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleFilter("categories", item)}
                            className={`mb-2 mr-2 rounded-full border px-3 py-1 text-sm capitalize transition ${
                              filters.categories.includes(item)
                                ? "border-[#832729] bg-[#832729] text-white"
                                : "border-stone-200 text-stone-700 hover:bg-stone-50"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <select
                  value={filters.sort}
                  onChange={(e) => {
                    setFilters({ ...filters, sort: e.target.value, page: 1 });
                    setHasMore(true);
                  }}
                  className="border rounded-full px-4 py-2 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="price_asc">Price Low → High</option>
                  <option value="price_desc">Price High → Low</option>
                </select>
              </div>
            </div>

            {/* FILTER PILLS */}
            <div className="mb-6 flex flex-wrap gap-3">
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-600"
                >
                  Clear all
                  <X className="size-3" />
                </button>
              ) : null}
              {filters.materials.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleFilter("materials", item)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#832729]/20 bg-[#832729]/5 px-3 py-1 text-sm capitalize text-[#832729]"
                >
                  {item}
                  <X className="size-3" />
                </button>
              ))}
              {filters.categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleFilter("categories", item)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#832729]/20 bg-[#832729]/5 px-3 py-1 text-sm capitalize text-[#832729]"
                >
                  {item}
                  <X className="size-3" />
                </button>
              ))}
              {filters.materials.length === 0 && filters.categories.length === 0 ? (
                <span className="text-sm text-stone-500">No active filters</span>
              ) : null}
            </div>

            <div className="mb-6 text-sm text-stone-500">
              Showing <span className="font-medium text-stone-700">{products.length}</span> products
            </div>

            {/* GRID */}
            {loading && filters.page === 1 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {products.map((product, index) => {
                    const signals = getProductSignals(product, index);

                    return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                    >
                      <Link href={`/product/${product.slug}`} className="block">
                        {/* ❤️ Wishlist */}
                        <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow transition-shadow">
                          <Heart className="size-4" />
                        </span>

                        {/* 🔥 FOMO ELEMENTS */}
                        {/* Low Stock Alert */}
                        {signals.showLowStock ? (
                          <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                            Only {signals.lowStockCount} left!
                          </div>
                        ) : null}

                        {/* Live Viewers */}
                        {signals.showViewerCount ? (
                          <div className="absolute left-3 top-12 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                            <Users className="size-3" />
                            {signals.viewerCount} viewing
                          </div>
                        ) : null}

                        {/* IMAGE */}
                        <div className="relative h-64 bg-[#f8f8f8] rounded-t-2xl overflow-hidden">
                          <Image
                            src={product.imageUrl || "/images/product-placeholder.svg"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          />
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                        </div>

                        {/* INFO */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 group-hover:text-[#8b6f47] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[#a67c52] font-semibold mt-2 text-lg">
                            {formatINR(product.price)}
                          </p>

                          <div className="flex justify-between mt-3 text-sm text-[#a67c52]">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              Limited time
                            </span>
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* INFINITE SCROLL TRIGGER */}
            {hasMore && (
              <div ref={observerRef} className="flex justify-center py-8">
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#8b6f47] rounded-full animate-spin"></div>
                    Loading more...
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* VARIABLE REWARD POPUP */}
      <VariableRewardPopup
        isVisible={showPopup}
        onClose={closePopup}
        discount={currentDiscount}
      />
    </>
  );
}
