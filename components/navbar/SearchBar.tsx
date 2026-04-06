"use client";

import { type FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Camera, Mic, Search, Loader2 } from "lucide-react";
import { SearchProduct } from "@/lib/products";
import { posthogEvents } from "@/lib/posthog-events";

type SearchBarProps = {
  variant: "desktop" | "mobile";
  query: string;
  placeholder: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const SearchBar = ({
  variant,
  query,
  placeholder,
  onQueryChange,
  onSubmit,
}: SearchBarProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=ai&limit=8`);
          const data = await response.json();
          setResults(data.products || []);
          setShowDropdown(true);

          // Track search event
          posthogEvents.trackSearch(searchQuery, data.products?.length || 0, {
            type: "ai",
            intent: data.intent,
          });
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    onQueryChange(value);
  };

  const handleResultClick = (productSlug: string, productName: string, position: number) => {
    setShowDropdown(false);
    // Track search result click
    posthogEvents.trackSearchResultClick(searchQuery, productSlug, productName, position);
    router.push(`/product/${productSlug}`);
  };

  if (variant === "mobile") {
    return (
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center h-10 rounded-full border border-gray-300 px-3">
          <Search className="size-4 text-gray-400 mr-2" />
          <input
            value={searchQuery}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </form>
    );
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-[600px]">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full h-11 rounded-full border border-gray-300 bg-white px-4 hover:border-gray-400 transition-colors focus-within:border-[#832729] focus-within:ring-1 focus-within:ring-[#832729]"
      >
        <Search className="size-4 text-gray-400 mr-2" />
        <input
          value={searchQuery}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
        />
        <div className="flex items-center gap-3 text-gray-400">
          {loading && <Loader2 className="size-4 animate-spin" />}
          <Camera className="size-4 cursor-pointer hover:text-[#832729]" />
          <Mic className="size-4 cursor-pointer hover:text-[#832729]" />
        </div>
      </form>

      {/* Search Dropdown */}
      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <Loader2 className="size-5 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {!loading && results.length === 0 && searchQuery.length >= 2 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No results found</p>
            </div>
          )}

          {!loading && results.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleResultClick(product.slug, product.name, index + 1)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No img</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {product.category} • {product.material}
                </p>
                <p className="text-sm font-semibold text-[#832729]">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {!loading && results.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowDropdown(false)}
                className="block w-full text-center text-sm text-[#832729] hover:text-[#6b2023] font-medium"
              >
                View all results
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
