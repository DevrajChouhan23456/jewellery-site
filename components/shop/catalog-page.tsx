"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VariableRewardPopup, useVariableRewards } from "@/components/variable-reward-popup";

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  slug?: string;
};

type CatalogPageData = {
  slug: string;
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
  const [total, setTotal] = useState(page.products.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
    // If page.products is already populated (from ShopPageProduct), don't fetch API
    if (page.products && page.products.length > 0) {
      setProducts(page.products);
      setTotal(page.products.length);
      setHasMore(page.products.length >= 9);
      return;
    }

    async function fetchProducts() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("slug", page.slug);
      params.set("page", String(filters.page));
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
        setTotal(data.total || 0);
        setHasMore((data.products || []).length >= 9);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters.sort, filters.minPrice, filters.maxPrice, filters.materials, filters.categories, page.slug]);

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
      {/* 🔥 CATEGORY HERO */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 py-14 mb-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
          {["Earrings", "Pendants", "Rings", "Gifts"].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-5 text-center shadow hover:shadow-xl transition"
            >
              <div className="h-32 bg-gray-100 rounded-xl mb-3" />
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-4">
          
          {/* 🔥 FILTER SIDEBAR */}
          <div className="sticky top-24 space-y-6 rounded-2xl bg-white p-6 shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button
                onClick={() =>
                  setFilters({
                    page: 1,
                    sort: "latest",
                    minPrice: "",
                    maxPrice: "",
                    materials: [],
                    categories: [],
                  })
                }
                className="text-sm text-red-500"
              >
                Clear
              </button>
            </div>

            {/* PRICE */}
            <div>
              <p className="text-sm mb-2">Price</p>
              <input
                placeholder="Min"
                className="w-full border rounded p-2 mb-2"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value, page: 1 })
                }
                onBlur={() => setHasMore(true)}
              />
              <input
                placeholder="Max"
                className="w-full border rounded p-2"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value, page: 1 })
                }
                onBlur={() => setHasMore(true)}
              />
            </div>

            {/* MATERIAL */}
            <div>
              <p className="text-sm mb-2">Material</p>
              {["gold", "diamond", "silver"].map((item) => (
                <label key={item} className="flex gap-2 text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(item)}
                    onChange={() => toggleFilter("materials", item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* CATEGORY */}
            <div>
              <p className="text-sm mb-2">Category</p>
              {["ring", "necklace", "bracelet"].map((item) => (
                <label key={item} className="flex gap-2 text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(item)}
                    onChange={() => toggleFilter("categories", item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* 🔥 PRODUCT AREA */}
          <div className="lg:col-span-3">

            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold capitalize">
                {page.slug}
              </h2>

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

            {/* FILTER PILLS */}
            <div className="mb-6 flex flex-wrap gap-3">
              {filters.materials.map((item) => (
                <span key={item} className="px-4 py-1 border rounded-full text-sm">
                  {item}
                </span>
              ))}
              {filters.categories.map((item) => (
                <span key={item} className="px-4 py-1 border rounded-full text-sm">
                  {item}
                </span>
              ))}
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
                            src={product.imageUrl || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          />
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
