function toggleFilter(type: "materials" | "categories", value: string) {
  setFilters((prev) => {
    const exists = prev[type].includes(value);

    return {
      ...prev,
      page: 1, // 🔥 reset page
      [type]: exists
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    };
  });
}
<div className="bg-white/70 backdrop-blur p-6 rounded-2xl shadow sticky top-24 space-y-6">

  <h3 className="text-lg font-semibold">Refine</h3>

  {/* PRICE */}
  <div>
    <p className="text-sm font-medium mb-2">Price</p>

    <input
      type="number"
      placeholder="Min ₹"
      value={filters.minPrice}
      className="w-full border p-2 rounded mb-2"
      onChange={(e) =>
        setFilters((p) => ({ ...p, minPrice: e.target.value, page: 1 }))
      }
    />

    <input
      type="number"
      placeholder="Max ₹"
      value={filters.maxPrice}
      className="w-full border p-2 rounded"
      onChange={(e) =>
        setFilters((p) => ({ ...p, maxPrice: e.target.value, page: 1 }))
      }
    />
  </div>

  {/* MATERIAL */}
  <div>
    <p className="text-sm font-medium mb-2">Material</p>

    {["gold", "diamond", "silver"].map((item) => (
      <label key={item} className="flex items-center gap-2 text-sm mb-1">
        <input
          type="checkbox"
          checked={filters.materials.includes(item)}
          onChange={() => {
            setFilters((prev) => {
              const exists = prev.materials.includes(item);
              return {
                ...prev,
                page: 1,
                materials: exists
                  ? prev.materials.filter((v) => v !== item)
                  : [...prev.materials, item],
              };
            });
          }}
        />
        <span className="capitalize">{item}</span>
      </label>
    ))}
  </div>

  {/* CATEGORY */}
  <div>
    <p className="text-sm font-medium mb-2">Category</p>

    {["ring", "necklace", "bracelet"].map((item) => (
      <label key={item} className="flex items-center gap-2 text-sm mb-1">
        <input
          type="checkbox"
          checked={filters.categories.includes(item)}
          onChange={() => {
            setFilters((prev) => {
              const exists = prev.categories.includes(item);
              return {
                ...prev,
                page: 1,
                categories: exists
                  ? prev.categories.filter((v) => v !== item)
                  : [...prev.categories, item],
              };
            });
          }}
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
        setFilters((p) => ({ ...p, sort: e.target.value, page: 1 }))
      }
    >
      <option value="latest">Latest</option>
      <option value="price_asc">Low → High</option>
      <option value="price_desc">High → Low</option>
    </select>
  </div>

</div>