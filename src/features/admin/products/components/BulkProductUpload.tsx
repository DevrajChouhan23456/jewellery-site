"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { createAdminProductsBulkRequest } from "@/features/admin/products/api";

type ProductRow = {
  name: string;
  slug: string;
  price: string;
  category: string;
  subCategory: string;
  material: string;
  type: string;
  images: string;
  stock?: string;
};

type ParsedProduct = {
  name: string;
  slug: string;
  price: number;
  category: string;
  subCategory: string | null;
  material: string;
  type: string;
  images: string[];
  stock: number;
};

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

export default function BulkProductUpload({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ created: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setParsedData([]);
    setErrors([]);
    setUploadResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as ProductRow[];
        const { validProducts, validationErrors } = validateAndParseProducts(rows);
        setParsedData(validProducts);
        setErrors(validationErrors);
      },
      error: (error) => {
        toast.error(`CSV parsing error: ${error.message}`);
      },
    });
  };

  const validateAndParseProducts = (rows: ProductRow[]): { validProducts: ParsedProduct[]; validationErrors: ValidationError[] } => {
    const validProducts: ParsedProduct[] = [];
    const validationErrors: ValidationError[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2; // +2 because header is row 1, and array is 0-indexed

      try {
        const name = row.name?.trim();
        if (!name) {
          validationErrors.push({ row: rowNum, field: 'name', message: 'Name is required' });
          return;
        }

        const slug = row.slug?.trim() || generateSlug(name);
        if (!slug) {
          validationErrors.push({ row: rowNum, field: 'slug', message: 'Slug is required' });
          return;
        }

        const price = parseInt(row.price?.trim() || '0');
        if (isNaN(price) || price < 0) {
          validationErrors.push({ row: rowNum, field: 'price', message: 'Price must be a positive number' });
          return;
        }

        const category = row.category?.trim();
        if (!category) {
          validationErrors.push({ row: rowNum, field: 'category', message: 'Category is required' });
          return;
        }

        const material = row.material?.trim();
        if (!material) {
          validationErrors.push({ row: rowNum, field: 'material', message: 'Material is required' });
          return;
        }

        const type = row.type?.trim();
        if (!type) {
          validationErrors.push({ row: rowNum, field: 'type', message: 'Type is required' });
          return;
        }

        const imagesStr = row.images?.trim();
        if (!imagesStr) {
          validationErrors.push({ row: rowNum, field: 'images', message: 'At least one image is required' });
          return;
        }
        const images = imagesStr.split(',').map(img => img.trim()).filter(Boolean);
        if (images.length === 0) {
          validationErrors.push({ row: rowNum, field: 'images', message: 'At least one image is required' });
          return;
        }

        const stock = parseInt(row.stock?.trim() || '0');
        if (isNaN(stock) || stock < 0) {
          validationErrors.push({ row: rowNum, field: 'stock', message: 'Stock must be a non-negative number' });
          return;
        }

        validProducts.push({
          name,
          slug,
          price,
          category,
          subCategory: row.subCategory?.trim() || null,
          material,
          type,
          images,
          stock,
        });
      } catch (error) {
        validationErrors.push({ row: rowNum, field: 'general', message: 'Invalid row data' });
      }
    });

    return { validProducts, validationErrors };
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    try {
      const result = await createAdminProductsBulkRequest(parsedData);
      setUploadResult({ created: result.created, skipped: result.skipped });
      toast.success(`Created ${result.created} products${result.skipped > 0 ? `, skipped ${result.skipped} duplicates` : ''}`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Bulk Product Upload</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-stone-400 mb-4" />
              <p className="text-lg font-medium mb-2">Upload CSV File</p>
              <p className="text-stone-600 mb-4">
                CSV should have columns: name, slug (optional), price, category, subCategory (optional), material, type, images (comma-separated), stock (optional)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{file.name}</p>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  Change File
                </Button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="font-medium text-red-800">Validation Errors</p>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {errors.slice(0, 10).map((error, i) => (
                      <p key={i} className="text-sm text-red-700">
                        Row {error.row}: {error.field} - {error.message}
                      </p>
                    ))}
                    {errors.length > 10 && (
                      <p className="text-sm text-red-700">... and {errors.length - 10} more errors</p>
                    )}
                  </div>
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-green-800">
                      {parsedData.length} products ready to upload
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Price</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((product, i) => (
                          <tr key={i} className="border-b border-green-100">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">₹{product.price}</td>
                            <td className="p-2">{product.category}</td>
                            <td className="p-2">{product.stock}</td>
                          </tr>
                        ))}
                        {parsedData.length > 5 && (
                          <tr>
                            <td colSpan={4} className="p-2 text-center text-green-600">
                              ... and {parsedData.length - 5} more products
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={parsedData.length === 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : `Upload ${parsedData.length} Products`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}