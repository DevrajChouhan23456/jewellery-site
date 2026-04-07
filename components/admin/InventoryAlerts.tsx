"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Package2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
}

interface TrendingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salesChange: number;
  images?: string[];
}

interface SalesDropAlert {
  productId: string;
  productName: string;
  productSlug: string;
  previousSales: number;
  currentSales: number;
  dropPercentage: number;
  images?: string[];
}

interface InventoryAlertsProps {
  lowStockProducts: LowStockProduct[];
  trendingProducts?: TrendingProduct[];
  salesDrops?: SalesDropAlert[];
}

function AlertListItem({
  href,
  image,
  title,
  subtitle,
  badgeClassName,
  badgeLabel,
}: {
  href: string;
  image?: string;
  title: string;
  subtitle: string;
  badgeClassName: string;
  badgeLabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[1.25rem] border border-stone-200/80 bg-white/75 p-3 transition hover:border-stone-300 hover:bg-stone-50/90"
    >
      <div className="relative size-12 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        <Image
          src={image || "/images/product-placeholder.svg"}
          alt={title}
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-950">{title}</p>
        <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
      </div>
      <Badge variant="outline" className={`rounded-full ${badgeClassName}`}>
        {badgeLabel}
      </Badge>
    </Link>
  );
}

export function InventoryAlerts({
  lowStockProducts,
  trendingProducts = [],
  salesDrops = [],
}: InventoryAlertsProps) {
  const sections = [
    {
      key: "stock",
      title: "Inventory pressure",
      description: "Products nearing or below their threshold.",
      icon: Package2,
      items: lowStockProducts.slice(0, 3).map((product) => ({
        href: `/admin/products/${product.id}`,
        image: product.images?.[0],
        title: product.name,
        subtitle: `${product.stock} left of ${product.lowStockThreshold} target`,
        badgeClassName:
          "border-rose-200 bg-rose-50 text-rose-700",
        badgeLabel: `${product.stock} left`,
      })),
    },
    {
      key: "trending",
      title: "Products accelerating",
      description: "Items gaining demand quickly this week.",
      icon: TrendingUp,
      items: trendingProducts.slice(0, 3).map((product) => ({
        href: `/admin/products/${product.id}`,
        image: product.images?.[0],
        title: product.name,
        subtitle: "Sales momentum is climbing",
        badgeClassName:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        badgeLabel: `+${product.salesChange.toFixed(1)}%`,
      })),
    },
    {
      key: "drop",
      title: "Products cooling off",
      description: "Items showing a notable recent drop in sales.",
      icon: TrendingDown,
      items: salesDrops.slice(0, 3).map((alert) => ({
        href: `/admin/products/${alert.productId}`,
        image: alert.images?.[0],
        title: alert.productName,
        subtitle: `${alert.previousSales} to ${alert.currentSales} sales`,
        badgeClassName:
          "border-amber-200 bg-amber-50 text-amber-700",
        badgeLabel: `-${alert.dropPercentage.toFixed(1)}%`,
      })),
    },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(240,253,244,0.96),rgba(236,253,245,0.88))] px-6 py-7 shadow-[0_22px_70px_-50px_rgba(21,128,61,0.3)]">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-700">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
              Healthy
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-emerald-950">
              Operations look stable
            </h2>
            <p className="mt-1 text-sm text-emerald-800/80">
              No inventory or demand alerts need attention right now.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_22px_70px_-50px_rgba(28,25,23,0.38)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-stone-100 px-6 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-stone-200 bg-stone-50 text-stone-700"
            >
              Attention center
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
              Intelligent alerts
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Surface stock pressure, rising demand, and slipping products in one
              place.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
            <Link href="/admin/products">
              Review catalog
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5 sm:px-7">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <div key={section.key} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-950">
                    {section.title}
                  </h3>
                  <p className="text-xs text-stone-500">{section.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <AlertListItem key={`${section.key}-${item.href}`} {...item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
