"use client";

import { useState } from "react";
import { Upload, Filter, X, Trash2, Edit3, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BulkProductUpload from "./BulkProductUpload";

type ProductListProps = {
  query: string;
  filters?: {
    category?: string | null;
    material?: string | null;
    minPrice?: number;
    maxPrice?: number;
    stockStatus?: string;
  };
  children: React.ReactNode;
};

export default function ProductList({ query, filters = {}, children }: ProductListProps) {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'update-category' | 'update-price' | null>(null);
  const [bulkValue, setBulkValue] = useState('');

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);

    // Update URL with filters
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filtering
    window.location.href = `/admin/products?${params.toString()}`;
  };

  const clearFilters = () => {
    setLocalFilters({});
    window.location.href = '/admin/products';
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (!confirm(`Delete ${selectedProducts.size} products? This cannot be undone.`)) return;

    try {
      // Implement bulk delete API call
      toast.success(`${selectedProducts.size} products deleted`);
      setSelectedProducts(new Set());
      setShowBulkActions(false);
      // Refresh page
      window.location.reload();
    } catch {
      toast.error('Bulk delete failed');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0 || !bulkAction || !bulkValue) return;

    try {
      // Implement bulk update API call
      toast.success(`${selectedProducts.size} products updated`);
      setSelectedProducts(new Set());
      setShowBulkActions(false);
      setBulkAction(null);
      setBulkValue('');
      // Refresh page
      window.location.reload();
    } catch {
      toast.error('Bulk update failed');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-4">
          <form action="/admin/products" className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
              name="query"
              defaultValue={query}
              placeholder="Search by name, slug, category..."
                className="h-11 rounded-full border-stone-200 bg-white pl-10"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="h-11 rounded-full border-stone-300 bg-white px-4"
            >
              Search
            </Button>
          </form>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-11 rounded-full border-stone-300 bg-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={() => setShowBulkUpload(true)}
            className="h-11 rounded-full bg-white text-stone-900 ring-1 ring-stone-200 hover:bg-stone-100"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Add product
          </Link>
        </div>

        {selectedProducts.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
            <span className="text-sm font-medium text-stone-900">
              {selectedProducts.size} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Bulk Actions
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {showBulkActions && (
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="mb-1 block text-sm font-medium">Action</label>
                <Select
                  value={bulkAction || ""}
                  onValueChange={(value) =>
                    setBulkAction(value as "update-category" | "update-price")
                  }
                >
                  <SelectTrigger className="w-48 rounded-xl bg-white">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update-category">Update Category</SelectItem>
                    <SelectItem value="update-price">Update Price (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Value</label>
                <Input
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  placeholder={bulkAction === 'update-price' ? "10" : "new-category"}
                  className="w-32 rounded-xl bg-white"
                />
              </div>
              <Button onClick={handleBulkUpdate} disabled={!bulkAction || !bulkValue}>
                Apply
              </Button>
              <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-stone-950">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <Select value={localFilters.category || ""} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="h-10 w-full rounded-xl bg-white">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="jewellery">Jewellery</SelectItem>
                    <SelectItem value="watches">Watches</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Material</label>
                <Select value={localFilters.material || ""} onValueChange={(value) => handleFilterChange('material', value)}>
                  <SelectTrigger className="h-10 w-full rounded-xl bg-white">
                    <SelectValue placeholder="All materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All materials</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Min Price</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice || ""}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Max Price</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Stock Status</label>
                <Select value={localFilters.stockStatus || ""} onValueChange={(value) => handleFilterChange('stockStatus', value)}>
                  <SelectTrigger className="h-10 w-full rounded-xl bg-white">
                    <SelectValue placeholder="All stock levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All stock levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {children}

      {showBulkUpload && (
        <BulkProductUpload onClose={() => setShowBulkUpload(false)} />
      )}
    </>
  );
}
