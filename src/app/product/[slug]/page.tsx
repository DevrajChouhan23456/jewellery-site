import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { GsapScrollReveal } from "@/components/motion/GsapScrollReveal";
import ProductGallery from "@/components/product/productGallery";
import ProductInfo from "@/components/product/productInfo";
import StickyProductHeader from "@/components/product/stickyProductHeader";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import { Separator } from "@/components/ui/separator";
import { formatMaterialLabel, formatProductName } from "@/lib/brand-copy";
import { getProductBySlug, getRelatedProducts } from "@/lib/getProductBySlug";

const FALLBACK_PRODUCT_IMAGE = "/images/product-placeholder.svg";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug).catch(() => null);

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    const displayName = formatProductName(product.name);
    const materialLabel = formatMaterialLabel(product.material);

    return {
      title: `${displayName} | Fashion Jewellery`,
      description: `Buy ${displayName} - ${materialLabel.toLowerCase()} ${product.type} | ${product.category}`,
      openGraph: {
        images: product.images,
        title: displayName,
        description: `${materialLabel} ${product.type} for gifting and occasion styling`,
      },
    };
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const displayName = formatProductName(product.name);
  const materialLabel = formatMaterialLabel(product.material);
  const productSizes = product.type.toLowerCase().includes("ring")
    ? ["10", "12", "14", "16", "18"]
    : ["Standard", "Adjustable", "Custom fit"];
  const relatedProducts = await getRelatedProducts(product, 4);
  const primaryImage = product.images[0] ?? FALLBACK_PRODUCT_IMAGE;
  const galleryImages =
    product.images.length > 0 ? product.images : [FALLBACK_PRODUCT_IMAGE];

  const spotlightItems = [
    {
      icon: BadgeCheck,
      label: `${materialLabel} finish`,
      helper: "Style-led and easy to wear",
    },
    {
      icon: Truck,
      label: "Careful delivery",
      helper: "Packed for gifting and occasion wear",
    },
    {
      icon: Clock3,
      label: "Fast dispatch",
      helper: "Quick fulfilment on ready styles",
    },
  ] as const;

  const promiseItems = [
    {
      icon: Sparkles,
      title: "Party-ready packing",
      description:
        "Each piece is packed to feel polished and gift-friendly the moment it arrives.",
    },
    {
      icon: ShieldCheck,
      title: "Reliable checkout",
      description:
        "Pricing, payment, and order totals stay clearly validated throughout checkout.",
    },
    {
      icon: Truck,
      title: "Support after purchase",
      description:
        "Delivery updates, order tracking, and a straightforward return window when you need help.",
    },
  ] as const;

  const detailRows = [
    { label: "SKU", value: product.slug.toUpperCase() },
    { label: "Material", value: materialLabel },
    { label: "Type", value: product.type },
    { label: "Category", value: product.category },
    {
      label: "Sub-category",
      value: product.subCategory ?? "Occasion edit",
    },
    { label: "Added", value: formatDate(product.createdAt) },
  ] as const;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#f7f2ea_38%,#f9fafb_100%)] text-stone-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-6rem] size-[28rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-[-8%] top-[5rem] size-[24rem] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(255,255,255,0)_70%)]" />
      </div>

      <StickyProductHeader
        product={{
          id: product.id,
          name: displayName,
          price: product.price,
          imageUrl: primaryImage,
        }}
      />

      <section className="relative z-10 luxury-shell py-8 sm:py-10 lg:py-14">
        <BlurFade inView delay={0.04}>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-stone-500"
          >
            <Link href="/" className="transition-colors hover:text-stone-950">
              Home
            </Link>
            <ChevronRight className="size-4 text-stone-300" />
            <span>Fashion Jewellery</span>
            <ChevronRight className="size-4 text-stone-300" />
            <span className="font-medium text-stone-950">{displayName}</span>
          </nav>
        </BlurFade>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.06fr_0.94fr] xl:items-start">
          <BlurFade inView delay={0.08}>
            <MagicCard
              className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.38)]"
              gradientFrom="#d6a75c"
              gradientTo="#7dd3fc"
              gradientColor="rgba(214,167,92,0.12)"
              gradientOpacity={0.24}
            >
              <section className="rounded-[inherit] p-4 sm:p-5">
                <ProductGallery images={galleryImages} />
              </section>
            </MagicCard>
          </BlurFade>

          <div className="space-y-6 xl:sticky xl:top-28">
            <BlurFade inView delay={0.12}>
              <MagicCard
                className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.38)]"
                gradientFrom="#d6a75c"
                gradientTo="#fb7185"
                gradientColor="rgba(120,53,15,0.1)"
                gradientOpacity={0.22}
              >
                <section className="relative overflow-hidden rounded-[inherit] px-6 py-7 sm:px-7 sm:py-8">
                  <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(214,167,92,0.22),transparent_58%)]" />
                  <div className="absolute bottom-0 right-0 size-40 rounded-full bg-cyan-100/55 blur-3xl" />

                  <div className="relative">
                    <Badge className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900">
                      Style Pick
                    </Badge>

                    <div className="mt-5 max-w-3xl">
                      <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                        {displayName}
                      </h1>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                        Styled in {materialLabel.toLowerCase()}, this{" "}
                        {product.type.toLowerCase()} brings easy sparkle,
                        polished detail, and outfit-friendly shine to daily
                        plans and special events.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-amber-200 bg-amber-50/80 px-3 py-1 text-stone-700"
                      >
                        {materialLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full border-cyan-200 bg-cyan-50/80 px-3 py-1 text-stone-700"
                      >
                        {product.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full border-stone-200 bg-stone-50 px-3 py-1 text-stone-700"
                      >
                        {product.category}
                      </Badge>
                      {product.subCategory ? (
                        <Badge
                          variant="outline"
                          className="rounded-full border-rose-200 bg-rose-50/80 px-3 py-1 text-stone-700"
                        >
                          {product.subCategory}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-7 flex flex-col gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                          Current price
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
                          {formatINR(product.price)}
                        </p>
                        <p className="mt-2 text-sm text-stone-500">
                          Inclusive of taxes and careful delivery packaging.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {spotlightItems.map((item) => {
                          const Icon = item.icon;

                          return (
                            <div
                              key={item.label}
                              className="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_18px_50px_-40px_rgba(28,25,23,0.42)]"
                            >
                              <div className="flex size-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-950 text-white">
                                <Icon className="size-4" />
                              </div>
                              <p className="mt-3 text-sm font-semibold text-stone-950">
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-stone-500">
                                {item.helper}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <Separator className="bg-stone-200/80" />

                      <ProductInfo
                        product={{
                          id: product.id,
                          name: displayName,
                          price: product.price,
                          imageUrl: primaryImage,
                          material: product.material,
                          sizes: productSizes,
                        }}
                      />
                    </div>
                  </div>
                </section>
              </MagicCard>
            </BlurFade>
          </div>
        </div>

        <GsapScrollReveal
          id="details"
          className="mt-6 grid scroll-mt-28 gap-6 xl:grid-cols-[1.15fr_0.85fr]"
        >
          <BlurFade inView delay={0.2}>
            <MagicCard
              className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.38)]"
              gradientFrom="#f59e0b"
              gradientTo="#38bdf8"
              gradientColor="rgba(28,25,23,0.06)"
              gradientOpacity={0.16}
            >
              <section className="rounded-[inherit] px-6 py-6 sm:px-7 sm:py-7">
                <Badge
                  variant="outline"
                  className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
                >
                  Product details
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                  Design notes and purchase details
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
                  Styled in {materialLabel.toLowerCase()} with a clean,
                  contemporary profile, the {displayName} is designed to feel
                  expressive for occasions and easy to repeat with different
                  outfits.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {promiseItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/85 p-4"
                      >
                        <div className="flex size-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-900">
                          <Icon className="size-4" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-stone-950">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-500">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6 bg-stone-200/80" />

                <dl className="grid gap-4 sm:grid-cols-2">
                  {detailRows.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.35rem] border border-stone-200/80 bg-white/90 px-4 py-4"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        {item.label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-stone-950 sm:text-base">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </MagicCard>
          </BlurFade>

          <div className="grid gap-6">
            <BlurFade inView delay={0.24}>
              <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(28,25,23,0.97),rgba(68,64,60,0.94),rgba(214,167,92,0.88))] px-6 py-6 text-white shadow-[0_24px_70px_-40px_rgba(28,25,23,0.82)] sm:px-7">
                <Badge className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                  Order journey
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  From styling pick to doorstep delivery.
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-200">
                  The storefront keeps pricing, cart totals, and payment checks
                  clear through checkout so the purchase feels smooth from start
                  to finish.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Add this piece to your bag or jump straight to checkout with Buy Now.",
                    "Review delivery details, payment, and totals in the secure checkout flow.",
                    "Track your order after payment confirmation and dispatch.",
                  ].map((step) => (
                    <div
                      key={step}
                      className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-stone-100"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </section>
            </BlurFade>

            <BlurFade inView delay={0.28}>
              <MagicCard
                className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.38)]"
                gradientFrom="#38bdf8"
                gradientTo="#fda4af"
                gradientColor="rgba(15,23,42,0.08)"
                gradientOpacity={0.18}
              >
                <section className="rounded-[inherit] px-6 py-6 sm:px-7">
                  <Badge
                    variant="outline"
                    className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-900"
                  >
                    Styling notes
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                    A polished piece with easy outfit-switching potential.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    Wear it solo for a sharper statement or pair it with other{" "}
                    {materialLabel.toLowerCase()} accents for a more dressed-up
                    look. The finish makes it easy to carry from day events into
                    evening plans.
                  </p>
                  <div className="mt-5 rounded-[1.35rem] border border-stone-200/80 bg-stone-50/85 px-4 py-4 text-sm leading-7 text-stone-600">
                    Need a gifting-ready order? Choose Buy Now and complete the
                    order flow directly from this page, then add delivery notes
                    during checkout.
                  </div>
                </section>
              </MagicCard>
            </BlurFade>
          </div>
        </GsapScrollReveal>
      </section>

      <section id="related" className="relative z-10 luxury-shell pb-14 sm:pb-16">
        <BlurFade inView delay={0.32}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge
                variant="outline"
                className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
              >
                More to explore
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
                You might also like
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Similar pieces picked to keep the same polished, dressy tone.
              </p>
            </div>
          </div>
        </BlurFade>

        {relatedProducts.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-stone-300 bg-white/75 px-6 py-12 text-center text-sm text-stone-500">
            More recommendations are on the way for this collection.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct, index) => {
              const relatedName = formatProductName(relatedProduct.name);
              const relatedMaterialLabel = formatMaterialLabel(relatedProduct.material);

              return (
                <BlurFade key={relatedProduct.id} inView delay={0.34 + index * 0.04}>
                  <MagicCard
                    className="overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/88 shadow-[0_20px_70px_-48px_rgba(28,25,23,0.42)]"
                    gradientFrom="#d6a75c"
                    gradientTo="#7dd3fc"
                    gradientColor="rgba(214,167,92,0.1)"
                    gradientOpacity={0.18}
                  >
                    <Link
                      href={`/product/${relatedProduct.slug}`}
                      className="group block rounded-[inherit]"
                    >
                      <div className="relative aspect-[4/4.7] overflow-hidden rounded-t-[inherit] bg-[linear-gradient(145deg,#fffaf1,#f6efe5,#eef8fb)]">
                        <Image
                          src={relatedProduct.images[0] || FALLBACK_PRODUCT_IMAGE}
                          alt={relatedName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(28,25,23,0.12))]" />
                        <Badge
                          variant="outline"
                          className="absolute left-4 top-4 rounded-full border-white/70 bg-white/85 text-stone-700 backdrop-blur"
                        >
                          {relatedMaterialLabel || "Style pick"}
                        </Badge>
                      </div>

                      <div className="px-5 pb-5 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                          {relatedProduct.category}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950 transition-colors group-hover:text-amber-800">
                          {relatedName}
                        </h3>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-base font-semibold text-stone-950">
                            {formatINR(relatedProduct.price)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 transition-colors group-hover:text-stone-950">
                            View piece
                            <ArrowRight className="size-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
