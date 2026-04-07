import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  return {
    title: query ? `Search results for "${query}"` : "Search",
    description: query
      ? `Find diamond jewellery matching "${query}". Browse our collection of rings, necklaces, earrings and more.`
      : "Search our diamond jewellery collection",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : "Search"}
          </h1>
        </div>

        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
