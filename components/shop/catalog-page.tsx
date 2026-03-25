"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function CatalogPage({ page }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(page.products || []);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    sort: searchParams.get("sort") || "latest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    materials:
      searchParams.get("materials")?.split(",").filter(Boolean) || [],
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
  });

  // ✅ TOGGLE FILTER (REUSABLE)
  const toggleFilter = useCallback(
    (type: "materials" | "categories", value: string) => {
      setFilters((prev) => {
        const exists = prev[type].includes(value);

        return {
          ...prev,
          page: 1,
          [type]: exists
            ? prev[type].filter((v) => v !== value)
            : [...prev[type], value],
        };
      });
    },
    []
  );

  // ✅ FETCH PRODUCTS
  useEffect(() => {
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
        const res = await fetch(`/api/products?${params}`);

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (filters.page === 1) {
          setProducts(data?.products || []);
        } else {
          setProducts((prev) => [...prev, ...(data?.products || [])]);
        }

        setTotal(data?.total || 0);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    filters.page,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.materials,
    filters.categories,
    page.slug,
  ]);

  // ✅ URL SYNC (NO LOOP)
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
  }, [
    filters.materials,
    filters.categories,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ]);

  // ✅ FORMAT PRICE
  function formatINR(price: number) {
    return `₹${price.toLocaleString("en-IN")}`;
  }

  return (
    <main className="bg-[#fffaf4] min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* 🔥 FILTER SIDEBAR */}
        <div className="bg-white/70 backdrop-blur p-6 rounded-2xl shadow sticky top-24 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Refine</h3>
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
              className="text-sm text-red-500 underline"
            >
              Clear
            </button>
          </div>

          {/* PRICE */}
          <div>
            <p className="text-sm font-medium mb-2">Price</p>

            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice}
              className="w-full border p-2 rounded mb-2"
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  minPrice: e.target.value,
                  page: 1,
                }))
              }
            />

            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  maxPrice: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>

          {/* MATERIAL */}
          <div>
            <p className="text-sm font-medium mb-2">Material</p>

            {["gold", "diamond", "silver"].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 text-sm mb-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.materials.includes(item)}
                  onChange={() => toggleFilter("materials", item)}
                  className="accent-black"
                />
                <span className="capitalize">{item}</span>
              </label>
            ))}
          </div>

          {/* CATEGORY */}
          <div>
            <p className="text-sm font-medium mb-2">Category</p>

            {["ring", "necklace", "bracelet"].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 text-sm mb-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(item)}
                  onChange={() => toggleFilter("categories", item)}
                  className="accent-black"
                />
                <span className="capitalize">{item}</span>
              </label>
            ))}
          </div>

          {/* SORT */}
          <div>
            <p className="text-sm font-medium mb-2">Sort</p>

            <select
              value={filters.sort}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  sort: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="latest">Latest</option>
              <option value="price_asc">Low → High</option>
              <option value="price_desc">High → Low</option>
            </select>
          </div>
        </div>

        {/* 🔥 PRODUCTS */}
        <div className="lg:col-span-3">
          
          {/* ACTIVE FILTERS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.materials.map((m) => (
              <span
                key={m}
                className="px-3 py-1 bg-black text-white text-xs rounded-full"
              >
                {m}
              </span>
            ))}
            {filters.categories.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-gray-200 text-xs rounded-full"
              >
                {c}
              </span>
            ))}
          </div>

          {/* COUNT */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {(filters.page - 1) * 9 + 1}–
            {Math.min(filters.page * 9, total)} of {total} designs
          </p>

          {/* LOADING */}
          {loading && filters.page === 1 ? (
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p: any) => (
                <Link
                  href={`/product/${p.id}`}
                  key={p.id}
                  className="group bg-white/80 backdrop-blur rounded-2xl overflow-hidden shadow hover:-translate-y-2 transition"
                >
                  <div className="relative h-64">
                    <Image
                      src={p.imageUrl || "/placeholder.jpg"}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <p className="text-[#a67c52] mt-2 font-semibold">
                      {formatINR(p.price)}
                    </p>

                    <div className="mt-3 flex justify-between items-center text-sm text-[#a67c52]">
                      View <ArrowRight className="size-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* LOAD MORE */}
          {filters.page * 9 < total && (
            <div className="text-center mt-8">
              <button
                disabled={loading}
                onClick={() =>
                  setFilters((p) => ({ ...p, page: p.page + 1 }))
                }
                className="px-6 py-3 bg-black text-white rounded-full disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}