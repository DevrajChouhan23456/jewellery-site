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
    <div className="sticky top-24 space-y-6 rounded-2xl bg-white/70 p-6 shadow backdrop-blur">
      <h3 className="text-lg font-semibold">Refine</h3>

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
          <label key={item} className="mb-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.materials.includes(item)}
              onChange={() => toggleFilter("materials", item, setFilters)}
            />
            <span className="capitalize">{item}</span>
          </label>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Category</p>

        {["ring", "necklace", "bracelet"].map((item) => (
          <label key={item} className="mb-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.categories.includes(item)}
              onChange={() => toggleFilter("categories", item, setFilters)}
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
  );
}
