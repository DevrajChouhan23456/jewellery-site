import Link from "next/link";
import { ArrowRight, PackagePlus, ShoppingBag } from "lucide-react";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminProductDashboardData } from "@/server/services/admin/products";

function formatDate(value: Date | null) {
  if (!value) {
    return "No products yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}

export default async function AdminDashboardPage() {
  await requireAdminPageAccess("/admin/dashboard");
  const dashboard = await getAdminProductDashboardData();

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 luxury-shadow backdrop-blur">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
              Admin Dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950">
              Run the product catalog with safer workflows and cleaner operational guardrails.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--luxury-muted)] sm:text-base">
              The catalog tools now validate input consistently, keep mutation logic
              in one service layer, and avoid loading the full product collection into
              the UI when the inventory grows.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Manage catalog
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Add new product
                <PackagePlus className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Total Products
              </p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">
                {dashboard.totalProducts}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Added This Month
              </p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">
                {dashboard.addedThisMonth}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Last Catalog Update
              </p>
              <p className="mt-3 text-lg font-semibold text-stone-950">
                {formatDate(dashboard.lastCreatedAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-950">Recent products</h2>
            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
              Latest catalog additions from the secured admin pipeline.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-[var(--luxury-gold-deep)] transition hover:text-stone-950"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {dashboard.recentProducts.length === 0 ? (
            <div className="px-6 py-10 text-sm text-[var(--luxury-muted)] sm:px-8">
              The catalog is empty. Add your first product to start merchandising the storefront.
            </div>
          ) : (
            dashboard.recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-[var(--luxury-gold-deep)]">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-950">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                      {product.category}
                      {product.subCategory ? ` / ${product.subCategory}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-950">
                      INR {product.price.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Added {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    Edit
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
