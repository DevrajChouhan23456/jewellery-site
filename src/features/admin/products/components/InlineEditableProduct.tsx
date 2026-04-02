"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Check, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAdminProductRequest } from "@/features/admin/products/api";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  subCategory: string | null;
  material: string;
  type: string;
  size: string | null;
  stock: number;
  images: string[];
};

type InlineEditableProductProps = {
  product: Product;
  isSelected?: boolean;
  onSelect?: (productId: string, selected: boolean) => void;
};

export default function InlineEditableProduct({ product, isSelected = false, onSelect }: InlineEditableProductProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(String(product.price));
  const [editStock, setEditStock] = useState(String(product.stock));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const newPrice = parseInt(editPrice);
    const newStock = parseInt(editStock);

    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Invalid price");
      return;
    }

    if (isNaN(newStock) || newStock < 0) {
      toast.error("Invalid stock");
      return;
    }

    setIsSaving(true);
    try {
      await updateAdminProductRequest({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: newPrice,
        category: product.category,
        subCategory: product.subCategory,
        material: product.material,
        type: product.type,
        size: product.size,
        images: product.images,
      });
      toast.success("Product updated");
      setIsEditing(false);
      // Update the product object (in a real app, you'd refetch or use state management)
      product.price = newPrice;
      product.stock = newStock;
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setIsEditing(false);
  };

  const previewImage = product.images[0] ?? "/images/sbg-women.jpg";

  return (
    <div className="grid gap-4 px-6 py-5 sm:px-8 lg:grid-cols-[auto_auto_1fr_auto] lg:items-center">
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="w-4 h-4 rounded border-stone-300"
        />
      )}
      <div className="relative h-20 w-20 overflow-hidden rounded-[1.25rem] border border-stone-200 bg-stone-100">
        <Image
          src={previewImage}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-stone-950">
          {product.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
          <span>{product.category}</span>
          {product.subCategory && <span>{product.subCategory}</span>}
          <span>{product.material}</span>
          <span>{product.type}</span>
          {product.size && <span>{product.size}</span>}
        </div>
        <p className="mt-3 text-sm text-[var(--luxury-muted)]">
          Slug: {product.slug}
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 lg:items-end">
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600">Price:</span>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-24 h-8 text-sm"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600">Stock:</span>
              <Input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-24 h-8 text-sm"
                min="0"
              />
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-2"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-right">
              <p className="text-lg font-semibold text-stone-950">
                INR {product.price.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-stone-600">
                Stock: {product.stock}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="h-8 px-3"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Link
                href={`/admin/products/${product.id}`}
                className="inline-flex items-center rounded-full border border-stone-300 px-3 py-1 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50 h-8"
              >
                View
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}