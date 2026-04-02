import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

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

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 luxury-shadow backdrop-blur">
        <div className="flex flex-col gap-6 border-b border-stone-100 px-6 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              Catalog Operations
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              Manage products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--luxury-muted)]">
              Search, review, and update products through a paginated admin view
              that stays responsive as the inventory grows.
            </p>
          </div>

          <ProductList query={productsPage.query} filters={productsPage.filters}>
            <div className="grid gap-4 border-b border-stone-100 px-6 py-5 sm:px-8 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  Total Matching Products
                </p>
                <p className="mt-3 text-3xl font-semibold text-stone-950">
                  {productsPage.totalItems}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  Page
                </p>
                <p className="mt-3 text-3xl font-semibold text-stone-950">
                  {productsPage.page}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  Page Size
                </p>
                <p className="mt-3 text-3xl font-semibold text-stone-950">
                  {productsPage.pageSize}
                </p>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {productsPage.items.length === 0 ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <h2 className="text-xl font-semibold text-stone-950">No matching products</h2>
                  <p className="mt-3 text-sm text-[var(--luxury-muted)]">
                    Try a different search term or create a new product entry for the catalog.
                  </p>
                </div>
              ) : (
                productsPage.items.map((product) => (
                  <InlineEditableProduct key={product.id} product={product} />
                ))
              )}
            </div>

            <div className="flex flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[var(--luxury-muted)]">
                Showing page {productsPage.page} of {productsPage.totalPages}.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={buildProductsPageHref(
                    Math.max(1, productsPage.page - 1),
                    productsPage.query,
                  )}
                  aria-disabled={productsPage.page === 1}
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition ${
                    productsPage.page === 1
                      ? "pointer-events-none border border-stone-200 bg-stone-100 text-stone-400"
                      : "border border-stone-300 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50"
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
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition ${
                    productsPage.page >= productsPage.totalPages
                      ? "pointer-events-none border border-stone-200 bg-stone-100 text-stone-400"
                      : "border border-stone-300 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          </ProductList>
        </div>
      </section>
    </main>
  );
}
