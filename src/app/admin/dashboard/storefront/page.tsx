import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { getStorefrontAdminData } from "@/lib/storefront";

import { StorefrontEditor } from "./storefront-editor";

export default async function StorefrontPage() {
  const initialData = await getStorefrontAdminData();

  return (
    <main className="luxury-shell luxury-section">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
            <Sparkles className="size-3.5" />
            Storefront Content
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Edit the homepage and shop experience
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--luxury-muted)]">
            Update hero slides, homepage merchandising blocks, and the linked
            shop collection pages from one Prisma-backed control room.
          </p>
        </div>
      </div>

      <StorefrontEditor initialData={initialData} />
    </main>
  );
}
