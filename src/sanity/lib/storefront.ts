import { prisma } from "@/lib/prisma";
import {
  defaultConciergeActions,
  defaultConciergeEyebrow,
  defaultConciergeTitle,
  defaultReassuranceHighlights,
  defaultServicePillars,
  defaultStylingJournalEyebrow,
  defaultStylingJournalTitle,
  defaultStylingTips,
  normalizeHomePageIcon,
  type HomePageActionCardContent,
  type HomePageInfoCardContent,
} from "@/lib/storefront-homepage-defaults";
import { sanityConfigured } from "@/sanity/env";

import { sanityFetch } from "./client";
import { homepageContentQuery, shopPageContentQuery } from "./queries";

type SectionKey = "category" | "trending" | "arrival" | "gender";

const defaultHomepageSections: Record<
  SectionKey,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    backgroundImageUrl?: string;
  }
> = {
  category: {
    eyebrow: "",
    title: "Find Your Perfect Match",
    subtitle: "Shop by Categories",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
  trending: {
    eyebrow: "",
    title: "Trending Now",
    subtitle: "Jewellery pieces everyone's eyeing right now",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
  arrival: {
    eyebrow: "500+ New Items",
    title: "New Arrivals",
    subtitle: "",
    description:
      "New arrivals dropping daily. Explore the latest launches for gifting, celebration, and signature self-expression.",
    ctaLabel: "Explore Latest Launches",
    ctaHref: "/shop/jewellery",
  },
  gender: {
    eyebrow: "",
    title: "Curated For You",
    subtitle: "Shop by Gender",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
};

function normalizeSection(
  key: SectionKey,
  section?: {
    eyebrow?: string | null;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    backgroundImageUrl?: string | null;
  } | null,
) {
  const fallback = defaultHomepageSections[key];

  return {
    id: `sanity-${key}`,
    key,
    eyebrow: section?.eyebrow ?? fallback.eyebrow,
    title: section?.title ?? fallback.title,
    subtitle: section?.subtitle ?? fallback.subtitle,
    description: section?.description ?? fallback.description,
    ctaLabel: section?.ctaLabel ?? fallback.ctaLabel,
    ctaHref: section?.ctaHref ?? fallback.ctaHref,
    backgroundImageUrl: section?.backgroundImageUrl ?? fallback.backgroundImageUrl,
  };
}

function sortByOrder<T extends { order?: number | null }>(items: T[]) {
  return items.slice().sort((first, second) => {
    const firstOrder = first.order ?? 0;
    const secondOrder = second.order ?? 0;
    return firstOrder - secondOrder;
  });
}

function normalizeCards(
  items:
    | Array<{
        id?: string | null;
        title?: string | null;
        subtitle?: string | null;
        image?: string | null;
        link?: string | null;
        badge?: string | null;
        order?: number | null;
      }>
    | null
    | undefined,
) {
  return sortByOrder(items ?? []).map((item, index) => ({
    id: item.id ?? `sanity-card-${index + 1}`,
    title: item.title ?? "Untitled card",
    subtitle: item.subtitle ?? "",
    image: item.image ?? null,
    link: item.link ?? "/shop/jewellery",
    badge: item.badge ?? null,
    order: item.order ?? index + 1,
  }));
}

function normalizeInfoCards(
  items:
    | Array<{
        title?: string | null;
        description?: string | null;
        icon?: string | null;
      }>
    | null
    | undefined,
  fallback: HomePageInfoCardContent[],
) {
  if (!items || items.length === 0) {
    return fallback.map((item) => ({ ...item }));
  }

  return items.map((item, index) => ({
    title: item.title ?? fallback[index]?.title ?? `Card ${index + 1}`,
    description:
      item.description ?? fallback[index]?.description ?? "Add a description.",
    icon: normalizeHomePageIcon(item.icon, fallback[index]?.icon ?? "sparkles"),
  }));
}

function normalizeActionCards(
  items:
    | Array<{
        title?: string | null;
        description?: string | null;
        href?: string | null;
        icon?: string | null;
      }>
    | null
    | undefined,
  fallback: HomePageActionCardContent[],
) {
  if (!items || items.length === 0) {
    return fallback.map((item) => ({ ...item }));
  }

  return items.map((item, index) => ({
    title: item.title ?? fallback[index]?.title ?? `Action ${index + 1}`,
    description:
      item.description ?? fallback[index]?.description ?? "Add a description.",
    href: item.href ?? fallback[index]?.href ?? "/contact",
    icon: normalizeHomePageIcon(item.icon, fallback[index]?.icon ?? "sparkles"),
  }));
}

function normalizeTextList(
  items: Array<string | null> | null | undefined,
  fallback: string[],
) {
  const normalizedItems = (items ?? []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  if (normalizedItems.length === 0) {
    return [...fallback];
  }

  return normalizedItems;
}

export async function getSanityHomepageContent() {
  if (!sanityConfigured) {
    return null;
  }

  try {
    const content = await sanityFetch<{
      heroSlides?: Array<{
        id?: string | null;
        imageUrl?: string | null;
        badge?: string | null;
        title?: string | null;
        subtitle?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
        order?: number | null;
      }>;
      sections?: {
        category?: {
          eyebrow?: string | null;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
          backgroundImageUrl?: string | null;
        } | null;
        trending?: {
          eyebrow?: string | null;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
          backgroundImageUrl?: string | null;
        } | null;
        arrival?: {
          eyebrow?: string | null;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
          backgroundImageUrl?: string | null;
        } | null;
        gender?: {
          eyebrow?: string | null;
          title?: string | null;
          subtitle?: string | null;
          description?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
          backgroundImageUrl?: string | null;
        } | null;
      } | null;
      categories?: Array<{
        id?: string | null;
        title?: string | null;
        subtitle?: string | null;
        image?: string | null;
        link?: string | null;
        badge?: string | null;
        order?: number | null;
      }>;
      trending?: Array<{
        id?: string | null;
        title?: string | null;
        subtitle?: string | null;
        image?: string | null;
        link?: string | null;
        badge?: string | null;
        order?: number | null;
      }>;
      arrivals?: Array<{
        id?: string | null;
        title?: string | null;
        subtitle?: string | null;
        image?: string | null;
        link?: string | null;
        badge?: string | null;
        order?: number | null;
      }>;
      gender?: Array<{
        id?: string | null;
        title?: string | null;
        subtitle?: string | null;
        image?: string | null;
        link?: string | null;
        badge?: string | null;
        order?: number | null;
      }>;
      servicePillars?: Array<{
        title?: string | null;
        description?: string | null;
        icon?: string | null;
      }>;
      reassuranceHighlights?: Array<{
        title?: string | null;
        description?: string | null;
        icon?: string | null;
      }>;
      conciergeEyebrow?: string | null;
      conciergeTitle?: string | null;
      conciergeActions?: Array<{
        title?: string | null;
        description?: string | null;
        href?: string | null;
        icon?: string | null;
      }>;
      stylingJournalEyebrow?: string | null;
      stylingJournalTitle?: string | null;
      stylingTips?: Array<string | null>;
    }>({
      query: homepageContentQuery,
    });

    if (!content) {
      return null;
    }

    return {
      categories: normalizeCards(content.categories),
      trending: normalizeCards(content.trending),
      arrivals: normalizeCards(content.arrivals),
      gender: normalizeCards(content.gender),
      heroSlides: sortByOrder(content.heroSlides ?? []).map((slide, index) => ({
        id: slide.id ?? `sanity-slide-${index + 1}`,
        imageUrl: slide.imageUrl ?? "/images/sbg-women.jpg",
        badge: slide.badge ?? "Signature Edit",
        title: slide.title ?? "Discover modern jewellery for every moment",
        subtitle:
          slide.subtitle ??
          "From everyday gold to celebration-ready diamonds, explore pieces that feel refined, expressive, and made to be remembered.",
        ctaLabel: slide.ctaLabel ?? "Shop Now",
        ctaHref: slide.ctaHref ?? "/shop/jewellery",
        order: slide.order ?? index + 1,
      })),
      sections: {
        category: normalizeSection("category", content.sections?.category),
        trending: normalizeSection("trending", content.sections?.trending),
        arrival: normalizeSection("arrival", content.sections?.arrival),
        gender: normalizeSection("gender", content.sections?.gender),
      },
      servicePillars: normalizeInfoCards(
        content.servicePillars,
        defaultServicePillars,
      ),
      reassuranceHighlights: normalizeInfoCards(
        content.reassuranceHighlights,
        defaultReassuranceHighlights,
      ),
      conciergeEyebrow: content.conciergeEyebrow ?? defaultConciergeEyebrow,
      conciergeTitle: content.conciergeTitle ?? defaultConciergeTitle,
      conciergeActions: normalizeActionCards(
        content.conciergeActions,
        defaultConciergeActions,
      ),
      stylingJournalEyebrow:
        content.stylingJournalEyebrow ?? defaultStylingJournalEyebrow,
      stylingJournalTitle:
        content.stylingJournalTitle ?? defaultStylingJournalTitle,
      stylingTips: normalizeTextList(content.stylingTips, defaultStylingTips),
    };
  } catch (error) {
    console.error("SANITY_HOMEPAGE_FETCH_ERROR", error);
    return null;
  }
}

export async function getSanityShopPageData(slug: string) {
  if (!sanityConfigured) {
    return null;
  }

  try {
    const page = await sanityFetch<{
      id: string;
      slug: string;
      title?: string | null;
      subtitle?: string | null;
      heroEyebrow?: string | null;
      heroTitle?: string | null;
      heroDescription?: string | null;
      heroImageUrl?: string | null;
      heroCtaLabel?: string | null;
      heroCtaHref?: string | null;
      features?: Array<{
        id?: string | null;
        title?: string | null;
        imageUrl?: string | null;
        href?: string | null;
        order?: number | null;
      }>;
    }>({
      query: shopPageContentQuery,
      params: { slug },
    });

    if (!page) {
      return null;
    }

    const where = {
      category: {
        contains: slug,
        mode: "insensitive" as const,
      },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 9,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      id: page.id,
      slug: page.slug,
      title: page.title ?? slug,
      subtitle: page.subtitle ?? "",
      heroEyebrow: page.heroEyebrow ?? "",
      heroTitle: page.heroTitle ?? `${slug} Jewellery`,
      heroDescription:
        page.heroDescription ?? `Explore ${slug} jewellery collection`,
      heroImageUrl: page.heroImageUrl ?? products[0]?.images?.[0] ?? "",
      heroCtaLabel: page.heroCtaLabel ?? "Shop Now",
      heroCtaHref: page.heroCtaHref ?? `/shop/${slug}`,
      resultCount: total,
      features: sortByOrder(page.features ?? []).map((feature, index) => ({
        id: feature.id ?? `sanity-feature-${index + 1}`,
        title: feature.title ?? "Untitled feature",
        imageUrl: feature.imageUrl ?? "/images/sbg-women.jpg",
        href: feature.href ?? `/shop/${slug}`,
        order: feature.order ?? index + 1,
      })),
      products: products.map((product, index) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] ?? "",
        badge: "",
        lowStockText: "",
        order: index,
      })),
    };
  } catch (error) {
    console.error("SANITY_SHOP_PAGE_FETCH_ERROR", error);
    return null;
  }
}
