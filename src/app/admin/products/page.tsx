import Image from "next/image";
import Link from "next/link";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminProductList } from "@/server/services/admin/products";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    query?: string;
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

          <div className="flex flex-wrap gap-3">
            <form action="/admin/products" className="flex flex-wrap items-center gap-3">
              <input
                name="query"
                defaultValue={productsPage.query}
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
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Add product
            </Link>
          </div>
        </div>

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
            productsPage.items.map((product) => {
              const previewImage = product.images[0] ?? "/images/sbg-women.jpg";

              return (
                <div
                  key={product.id}
                  className="grid gap-4 px-6 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto] lg:items-center"
                >
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
                      {product.subCategory ? <span>{product.subCategory}</span> : null}
                      <span>{product.material}</span>
                      <span>{product.type}</span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--luxury-muted)]">
                      Slug: {product.slug}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-lg font-semibold text-stone-950">
                      INR {product.price.toLocaleString("en-IN")}
                    </p>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
                    >
                      Edit product
                    </Link>
                  </div>
                </div>
              );
            })
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
      </section>
    </main>
  );
}
