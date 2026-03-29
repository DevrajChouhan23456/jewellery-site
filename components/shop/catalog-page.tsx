"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
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
  return `INR ${price.toLocaleString("en-IN")}`;
}

export function CatalogPage({ page, selectedSubcategory }: CatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<CatalogProduct[]>(page.products || []);
  const [total, setTotal] = useState(page.products.length);
  const [loading, setLoading] = useState(false);
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
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("slug", page.slug);
      params.set("page", String(filters.page));
      params.set("sort", filters.sort);

      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.materials.length) {
        params.set("materials", filters.materials.join(","));
      }
      if (filters.categories.length) {
        params.set("categories", filters.categories.join(","));
      }

      try {
        const response = await fetch(`/api/products?${params.toString()}`, { 
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        console.log('[CATALOG] API URL:', `/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        const data = (await response.json()) as {
          products?: CatalogProduct[];
          total?: number;
        };
        console.log('[CATALOG] API Response:', data);

        if (filters.page === 1) {
          setProducts(data.products || []);
        } else {
          setProducts((prev) => [...prev, ...(data.products || [])]);
        }

        setTotal(data.total || 0);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchProducts();
  }, [
    filters.page,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.materials,
    filters.categories,
    page.slug,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.materials.length) params.set("materials", filters.materials.join(","));
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
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
    router,
  ]);

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-4">
        <div className="sticky top-24 space-y-6 rounded-2xl bg-white/70 p-6 shadow backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Refine</h3>
            <button
              type="button"
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

          <div>
            <p className="mb-2 text-sm font-medium">Price</p>

            <input
              type="number"
              placeholder="Min INR"
              value={filters.minPrice}
              className="mb-2 w-full rounded border p-2"
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: event.target.value,
                  page: 1,
                }))
              }
            />

            <input
              type="number"
              placeholder="Max INR"
              value={filters.maxPrice}
              className="w-full rounded border p-2"
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: event.target.value,
                  page: 1,
                }))
              }
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Material</p>

            {["gold", "diamond", "silver"].map((item) => (
              <label
                key={item}
                className="mb-2 flex cursor-pointer items-center gap-3 text-sm"
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

          <div>
            <p className="mb-2 text-sm font-medium">Category</p>

            {["ring", "necklace", "bracelet"].map((item) => (
              <label
                key={item}
                className="mb-2 flex cursor-pointer items-center gap-3 text-sm"
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

          <div>
            <p className="mb-2 text-sm font-medium">Sort</p>

            <select
              value={filters.sort}
              className="w-full rounded border p-2"
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: event.target.value,
                  page: 1,
                }))
              }
            >
              <option value="latest">Latest</option>
              <option value="price_asc">Low to High</option>
              <option value="price_desc">High to Low</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.materials.map((material) => (
              <span
                key={material}
                className="rounded-full bg-black px-3 py-1 text-xs text-white"
              >
                {material}
              </span>
            ))}
            {filters.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-gray-200 px-3 py-1 text-xs"
              >
                {category}
              </span>
            ))}
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Showing {(filters.page - 1) * 9 + 1}-
            {Math.min(filters.page * 9, total)} of {total} designs
          </p>

          {loading && filters.page === 1 ? (
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="group overflow-hidden rounded-2xl bg-white/80 shadow backdrop-blur transition hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    <Image
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-serif">{product.name}</h3>
                    <p className="mt-2 font-semibold text-[#a67c52]">
                      {formatINR(product.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm text-[#a67c52]">
                      View <ArrowRight className="size-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filters.page * 9 < total ? (
            <div className="mt-8 text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
