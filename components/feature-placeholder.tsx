import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function FeaturePlaceholder({
  title,
  description,
  backHref = "/admin/dashboard",
  backLabel = "Back to dashboard",
}: FeaturePlaceholderProps) {
  return (
    <main className="luxury-shell luxury-section">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 luxury-shadow backdrop-blur sm:p-10">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>

        <div className="mt-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-deep)]">
            <Wrench className="size-3.5" />
            Legacy Feature
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--luxury-muted)]">
            {description}
          </p>
        </div>
      </section>
    </main>
  );
}
