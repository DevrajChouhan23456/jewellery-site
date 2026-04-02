"use client";

import { useState } from "react";
import { Upload, Filter, X, Trash2, Edit3, Package } from "lucide-react";
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // In a real implementation, you'd get all product IDs from the current page
      // For now, we'll just clear selection
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set());
    }
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <form action="/admin/products" className="flex flex-wrap items-center gap-3">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search by name, slug, category..."
              className="h-11 min-w-[260px] rounded-full border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
            <button
              type="submit"
              className="h-11 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Search
            </button>
          </form>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-11 rounded-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={() => setShowBulkUpload(true)}
            className="h-11 rounded-full bg-stone-100 text-stone-900 hover:bg-stone-200"
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
          <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-xl">
            <span className="text-sm font-medium">{selectedProducts.size} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Bulk Actions
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {showBulkActions && (
          <div className="p-4 bg-stone-50 rounded-xl border">
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <Select value={bulkAction || ""} onValueChange={(value: any) => setBulkAction(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update-category">Update Category</SelectItem>
                    <SelectItem value="update-price">Update Price (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <Input
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  placeholder={bulkAction === 'update-price' ? "10" : "new-category"}
                  className="w-32"
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
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select value={localFilters.category || ""} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="h-9">
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
                <label className="block text-sm font-medium mb-1">Material</label>
                <Select value={localFilters.material || ""} onValueChange={(value) => handleFilterChange('material', value)}>
                  <SelectTrigger className="h-9">
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
                <label className="block text-sm font-medium mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice || ""}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Status</label>
                <Select value={localFilters.stockStatus || ""} onValueChange={(value) => handleFilterChange('stockStatus', value)}>
                  <SelectTrigger className="h-9">
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