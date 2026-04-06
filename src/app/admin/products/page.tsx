import Link from "next/link";
import { ArrowLeft, PackagePlus, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminProductList } from "@/server/services/admin/products";
import ProductList from "@/features/admin/products/components/ProductList";
import InlineEditableProduct from "@/features/admin/products/components/InlineEditableProduct";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    stockStatus?: string;
  }>;
};

function buildProductsPageHref(page: number, query: string) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query) {
    params.set("query", query);
  }

  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdminPageAccess("/admin/products");

  const resolvedSearchParams = await searchParams;
  const productsPage = await getAdminProductList(resolvedSearchParams);

  const listFilters = {
    category: productsPage.filters.category,
    material: productsPage.filters.material,
    minPrice: productsPage.filters.minPrice,
    maxPrice: productsPage.filters.maxPrice,
    stockStatus: productsPage.filters.stockStatus,
  };

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <BlurFade inView delay={0.04}>
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_24px_80px_-52px_rgba(28,25,23,0.38)] backdrop-blur">
            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href="/admin/dashboard">
                      <ArrowLeft className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700">
                    Catalog workspace
                  </Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950">
                  Manage the catalog with cleaner search, editing, and context.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Review products, filter the inventory, and jump into edits from
                  a calmer admin surface that matches the updated dashboard.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <PackagePlus className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Matching
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {productsPage.totalItems}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Search className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Page
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {productsPage.page}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <SlidersHorizontal className="size-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Page size
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {productsPage.pageSize}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

        <section className="rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
          <ProductList query={productsPage.query} filters={listFilters}>
            <div className="divide-y divide-stone-100">
              {productsPage.items.length === 0 ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <h2 className="text-xl font-semibold text-stone-950">
                    No matching products
                  </h2>
                  <p className="mt-3 text-sm text-stone-500">
                    Try a broader search term or create a new product for the
                    catalog.
                  </p>
                </div>
              ) : (
                productsPage.items.map((product) => (
                  <InlineEditableProduct key={product.id} product={product} />
                ))
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-stone-100 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-stone-500">
                Showing page {productsPage.page} of {productsPage.totalPages}.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={buildProductsPageHref(
                    Math.max(1, productsPage.page - 1),
                    productsPage.query,
                  )}
                  aria-disabled={productsPage.page === 1}
                  className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-sm font-medium transition ${
                    productsPage.page === 1
                      ? "pointer-events-none border-stone-200 bg-stone-100 text-stone-400"
                      : "border-stone-300 bg-white text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildProductsPageHref(
                    Math.min(productsPage.totalPages, productsPage.page + 1),
                    productsPage.query,
                  )}
                  aria-disabled={productsPage.page >= productsPage.totalPages}
                  className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-sm font-medium transition ${
                    productsPage.page >= productsPage.totalPages
                      ? "pointer-events-none border-stone-200 bg-stone-100 text-stone-400"
                      : "border-stone-300 bg-white text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          </ProductList>
        </section>
      </div>
    </AdminPageShell>
  );
}
