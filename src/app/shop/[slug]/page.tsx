import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogPage } from "@/components/shop/catalog-page";
import { getShopPageData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

type ShopPageRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ShopPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getShopPageData(slug);

  if (!page) {
    return {
      title: "Shop | Jewellery",
      description: "Explore the jewellery storefront.",
    };
  }

  return {
    title: `${page.title} | Jewellery`,
    description: page.heroDescription,
    openGraph: {
      title: page.heroTitle,
      description: page.heroDescription,
      images: page.heroImageUrl ? [page.heroImageUrl] : undefined,
    },
  };
}

export default async function ShopPageRoute({ params }: ShopPageRouteProps) {
  const { slug } = await params;
  const page = await getShopPageData(slug);

  if (!page) {
    notFound();
  }

  return <CatalogPage page={page} />;
}
