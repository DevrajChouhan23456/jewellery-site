"use client";

import type { Dispatch, SetStateAction } from "react";

export type CatalogFiltersState = {
  page: number;
  sort: string;
  minPrice: string;
  maxPrice: string;
  materials: string[];
  categories: string[];
};

type FiltersProps = {
  filters: CatalogFiltersState;
  setFilters: Dispatch<SetStateAction<CatalogFiltersState>>;
};

function toggleFilter(
  type: "materials" | "categories",
  value: string,
  setFilters: Dispatch<SetStateAction<CatalogFiltersState>>,
) {
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
}

export function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="sticky top-24 space-y-8 rounded-2xl bg-white p-6 shadow-sm border">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
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
          className="text-xs text-red-500 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* PRICE */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Price</p>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: e.target.value,
                page: 1,
              }))
            }
          />

          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: e.target.value,
                page: 1,
              }))
            }
          />
        </div>
      </div>

      {/* MATERIAL */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Material</p>

        <div className="flex flex-wrap gap-2">
          {["gold", "diamond", "silver"].map((item) => {
            const active = filters.materials.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleFilter("materials", item, setFilters)}
                className={`px-4 py-1.5 text-sm rounded-full border transition ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORY */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Category</p>

        <div className="flex flex-wrap gap-2">
          {["ring", "necklace", "bracelet"].map((item) => {
            const active = filters.categories.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleFilter("categories", item, setFilters)}
                className={`px-4 py-1.5 text-sm rounded-full border transition ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* SORT */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Sort By</p>

        <select
          value={filters.sort}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sort: e.target.value,
              page: 1,
            }))
          }
        >
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
}