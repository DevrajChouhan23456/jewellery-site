import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  PackagePlus,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import ProductForm from "@/features/admin/products/components/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { requireAdminPageAccess } from "@/server/auth/admin";

export default async function NewProductPage() {
  await requireAdminPageAccess("/admin/products/new");

  return (
    <div className="space-y-6">
      <BlurFade inView delay={0.04}>
        <MagicCard
          className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.4)]"
          gradientFrom="#d6a75c"
          gradientTo="#7dd3fc"
          gradientColor="rgba(214,167,92,0.12)"
          gradientOpacity={0.28}
        >
          <section className="relative overflow-hidden rounded-[inherit] px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(214,167,92,0.24),transparent_58%)]" />
            <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/admin/products">
                      <ArrowLeft className="size-4" />
                      Products
                    </Link>
                  </Button>
                  <Badge className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-700">
                    Product Studio
                  </Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  Add products faster with a cleaner admin workflow.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Drafts auto-save locally, pricing guidance is built in, and AI
                  can help with product copy so admins can move from idea to live
                  catalog entry with less friction.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-5">
                    <Link href="/admin/products">
                      Open catalog
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-stone-300 bg-white/85 px-5"
                  >
                    <Link href="/admin/dashboard">
                      Back to dashboard
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  {
                    icon: PackagePlus,
                    title: "Structured entry",
                    helper: "Friendly fields with smarter defaults",
                  },
                  {
                    icon: WandSparkles,
                    title: "AI support",
                    helper: "Generate a strong first-pass description",
                  },
                  {
                    icon: Sparkles,
                    title: "Publish confidence",
                    helper: "Checklist and pricing guidance in one place",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 px-4 py-4"
                  >
                    <div className="inline-flex rounded-2xl border border-white/70 bg-stone-950 p-2 text-white">
                      <item.icon className="size-4" />
                    </div>
                    <p className="mt-3 text-base font-semibold text-stone-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MagicCard>
      </BlurFade>

      <ProductForm />
    </div>
  );
}
