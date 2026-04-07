import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles, TriangleAlert } from "lucide-react";

import { sanityConfigured, studioPath } from "@/sanity/env";

const studioSetupSnippet = `NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production`;

export default function StorefrontPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.4)]">
        <div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-900">
              <TriangleAlert className="size-3.5" />
              Legacy Route
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              The Prisma storefront editor is retired
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
              Homepage campaigns and shop-page merchandising now have one
              editorial source of truth in Sanity Studio. This route stays
              online only to catch old bookmarks and stop duplicate edits from
              drifting apart.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={studioPath}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                {sanityConfigured ? "Open Sanity Studio" : "Open Studio setup"}
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
              >
                Return to dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200/80 bg-stone-50/85 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700">
              <Sparkles className="size-3.5" />
              {sanityConfigured ? "Canonical Editor" : "Setup Required"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
              {sanityConfigured
                ? "Use Studio for storefront storytelling"
                : "Finish Studio setup before editing content"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {sanityConfigured
                ? "Sanity now owns homepage sections, hero campaigns, and shop-page shell copy. Prisma still powers operational commerce data such as products, pricing, carts, and orders."
                : "The legacy Prisma editor is locked to prevent drift. Add the Sanity project variables below, restart the app, and continue editorial changes in Studio."}
            </p>

            {sanityConfigured ? (
              <p className="mt-4 rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                If you previously used{" "}
                <code className="mx-1 rounded bg-stone-100 px-1.5 py-0.5 text-stone-800">
                  /admin/dashboard/storefront
                </code>
                {" "}or{" "}
                <code className="mx-1 rounded bg-stone-100 px-1.5 py-0.5 text-stone-800">
                  /admin/dashboard/slider-image
                </code>
                , update those bookmarks to{" "}
                <code className="ml-1 rounded bg-stone-100 px-1.5 py-0.5 text-stone-800">
                  {studioPath}
                </code>
                .
              </p>
            ) : (
              <pre className="mt-4 overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-stone-950 px-5 py-4 text-sm text-stone-100">
                {studioSetupSnippet}
              </pre>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_18px_60px_-45px_rgba(28,25,23,0.45)]">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">
            Why this changed
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Keeping both the Prisma editor and Sanity Studio writable would let
            homepage and shop-page content drift over time. Retiring write
            access here keeps the published editorial model aligned with the
            new Studio workflow.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_18px_60px_-45px_rgba(28,25,23,0.45)]">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">
            What still lives in Prisma
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Catalog operations, pricing, carts, orders, and fulfillment remain
            in the existing admin stack. This cleanup only removes the duplicate
            Prisma-based editorial UI for storefront storytelling.
          </p>
        </section>
      </div>
    </div>
  );
}
