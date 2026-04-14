"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { SearchProduct } from "@/lib/products";
import { formatMaterialLabel, formatProductName } from "@/lib/brand-copy";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Enter a search term to find products</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-lg bg-gray-200"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="space-y-2 p-4">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No products found for &quot;{query}&quot;</p>
        <p className="mt-2 text-sm text-gray-400">
          Try searching for keywords like &quot;american diamond&quot;,
          &quot;jhumka&quot;, or &quot;necklace set&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <motion.div
          key={product.id}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <Link href={`/product/${product.slug}`} className="block">
            <div className="group relative aspect-square overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={formatProductName(product.name)}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-sm text-gray-400">No image</span>
                </div>
              )}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            <div className="p-4">
              <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-[#832729]">
                {formatProductName(product.name)}
              </h3>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-semibold text-[#832729]">
                  Rs. {product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm capitalize text-gray-500">
                  {product.category}
                </span>
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {formatMaterialLabel(product.material)} · {product.type}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
