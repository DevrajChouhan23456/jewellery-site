import "dotenv/config";

import { type Prisma, PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createClient } from "next-sanity";

import {
  defaultConciergeActions,
  defaultConciergeEyebrow,
  defaultConciergeTitle,
  defaultReassuranceHighlights,
  defaultServicePillars,
  defaultStylingJournalEyebrow,
  defaultStylingJournalTitle,
  defaultStylingTips,
} from "../src/lib/storefront-homepage-defaults";
import { apiVersion } from "../src/sanity/env";

const prisma = new PrismaClient({}).$extends(withAccelerate());

type SectionKey = "category" | "trending" | "arrival" | "gender";

const shopPageSelect = {
  slug: true,
  title: true,
  subtitle: true,
  heroEyebrow: true,
  heroTitle: true,
  heroDescription: true,
  heroImageUrl: true,
  heroCtaLabel: true,
  heroCtaHref: true,
  features: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      href: true,
      order: true,
    },
  },
} satisfies Prisma.ShopPageSelect;

type ShopPageSeedRecord = Prisma.ShopPageGetPayload<{
  select: typeof shopPageSelect;
}>;

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

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalText(value: string | null | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function buildArrayKey(prefix: string, value: string, index: number) {
  return `${prefix}-${value || index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function buildHomePageSection(
  key: SectionKey,
  section?: {
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    description: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    backgroundImageUrl: string | null;
  },
) {
  const fallback = defaultHomepageSections[key];

  return {
    _type: "homePageSection",
    eyebrow: optionalText(section?.eyebrow) ?? fallback.eyebrow,
    title: optionalText(section?.title) ?? fallback.title,
    subtitle: optionalText(section?.subtitle) ?? fallback.subtitle,
    description: optionalText(section?.description) ?? fallback.description,
    ctaLabel: optionalText(section?.ctaLabel) ?? fallback.ctaLabel,
    ctaHref: optionalText(section?.ctaHref) ?? fallback.ctaHref,
    backgroundImageUrl:
      optionalText(section?.backgroundImageUrl) ?? fallback.backgroundImageUrl,
  };
}

function isInsufficientPermissionsError(
  error: unknown,
): error is {
  statusCode?: number;
  details?: {
    items?: Array<{
      error?: {
        permission?: string;
        type?: string;
      };
    }>;
  };
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    statusCode?: number;
    details?: {
      items?: Array<{
        error?: {
          permission?: string;
          type?: string;
        };
      }>;
    };
  };

  return (
    candidate.statusCode === 403 &&
    Array.isArray(candidate.details?.items) &&
    candidate.details.items.some(
      (item) => item.error?.type === "insufficientPermissionsError",
    )
  );
}

async function main() {
  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = requireEnv("SANITY_API_WRITE_TOKEN");
  const dryRun = process.argv.includes("--dry-run");

  const sanityClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  const [heroSlides, homepageSections, curatedItems, shopPages] =
    await Promise.all([
      prisma.slider.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          imageUrl: true,
          badge: true,
          title: true,
          subtitle: true,
          ctaLabel: true,
          ctaHref: true,
          order: true,
        },
      }),
      prisma.homepageSection.findMany({
        orderBy: { key: "asc" },
        select: {
          key: true,
          eyebrow: true,
          title: true,
          subtitle: true,
          description: true,
          ctaLabel: true,
          ctaHref: true,
          backgroundImageUrl: true,
        },
      }),
      prisma.curatedItem.findMany({
        orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          section: true,
          title: true,
          subtitle: true,
          image: true,
          link: true,
          badge: true,
          order: true,
        },
      }),
      prisma.shopPage.findMany({
        orderBy: { title: "asc" },
        select: shopPageSelect,
      }),
    ]);

  const sectionMap = new Map(
    homepageSections.map((section) => [section.key as SectionKey, section]),
  );

  const homePageDocument = {
    _id: "homePage",
    _type: "homePage",
    heroSlides: heroSlides.map((slide, index) => ({
      _type: "heroSlide",
      _key: buildArrayKey("hero-slide", slide.id, index),
      imageUrl: slide.imageUrl,
      badge: optionalText(slide.badge),
      title:
        optionalText(slide.title) ??
        "Discover modern jewellery for every moment",
      subtitle:
        optionalText(slide.subtitle) ??
        "From everyday gold to celebration-ready diamonds, explore pieces that feel refined, expressive, and made to be remembered.",
      ctaLabel: optionalText(slide.ctaLabel) ?? "Shop Now",
      ctaHref: optionalText(slide.ctaHref) ?? "/shop/jewellery",
      order: slide.order,
    })),
    categorySection: buildHomePageSection("category", sectionMap.get("category")),
    categoryCards: curatedItems
      .filter((item) => item.section === "category")
      .map((item, index) => ({
        _type: "homePageCard",
        _key: buildArrayKey("category-card", item.id, index),
        title: item.title,
        subtitle: optionalText(item.subtitle),
        imageUrl: optionalText(item.image),
        link: item.link,
        badge: optionalText(item.badge),
        order: item.order,
      })),
    trendingSection: buildHomePageSection("trending", sectionMap.get("trending")),
    trendingCards: curatedItems
      .filter((item) => item.section === "trending")
      .map((item, index) => ({
        _type: "homePageCard",
        _key: buildArrayKey("trending-card", item.id, index),
        title: item.title,
        subtitle: optionalText(item.subtitle),
        imageUrl: optionalText(item.image),
        link: item.link,
        badge: optionalText(item.badge),
        order: item.order,
      })),
    arrivalSection: buildHomePageSection("arrival", sectionMap.get("arrival")),
    arrivalCards: curatedItems
      .filter((item) => item.section === "arrival")
      .map((item, index) => ({
        _type: "homePageCard",
        _key: buildArrayKey("arrival-card", item.id, index),
        title: item.title,
        subtitle: optionalText(item.subtitle),
        imageUrl: optionalText(item.image),
        link: item.link,
        badge: optionalText(item.badge),
        order: item.order,
      })),
    genderSection: buildHomePageSection("gender", sectionMap.get("gender")),
    genderCards: curatedItems
      .filter((item) => item.section === "gender")
      .map((item, index) => ({
        _type: "homePageCard",
        _key: buildArrayKey("gender-card", item.id, index),
        title: item.title,
        subtitle: optionalText(item.subtitle),
        imageUrl: optionalText(item.image),
        link: item.link,
        badge: optionalText(item.badge),
        order: item.order,
      })),
    servicePillars: defaultServicePillars.map((item, index) => ({
      _type: "homePageInfoCard",
      _key: buildArrayKey("service-pillar", item.title, index),
      ...item,
    })),
    reassuranceHighlights: defaultReassuranceHighlights.map((item, index) => ({
      _type: "homePageInfoCard",
      _key: buildArrayKey("reassurance-highlight", item.title, index),
      ...item,
    })),
    conciergeEyebrow: defaultConciergeEyebrow,
    conciergeTitle: defaultConciergeTitle,
    conciergeActions: defaultConciergeActions.map((item, index) => ({
      _type: "homePageActionCard",
      _key: buildArrayKey("concierge-action", item.title, index),
      ...item,
    })),
    stylingJournalEyebrow: defaultStylingJournalEyebrow,
    stylingJournalTitle: defaultStylingJournalTitle,
    stylingTips: defaultStylingTips,
  };

  const shopPageDocuments = (shopPages as ShopPageSeedRecord[]).map((page) => ({
    _id: `shopPage-${page.slug}`,
    _type: "shopPage",
    title: page.title,
    slug: {
      _type: "slug",
      current: page.slug,
    },
    subtitle: optionalText(page.subtitle),
    heroEyebrow: optionalText(page.heroEyebrow),
    heroTitle: page.heroTitle,
    heroDescription: page.heroDescription,
    heroImageUrl: optionalText(page.heroImageUrl),
    heroCtaLabel: optionalText(page.heroCtaLabel),
    heroCtaHref: optionalText(page.heroCtaHref),
    features: page.features.map((feature, index) => ({
      _type: "shopFeature",
      _key: buildArrayKey("shop-feature", feature.id, index),
      title: feature.title,
      imageUrl: optionalText(feature.imageUrl),
      href: feature.href,
      order: feature.order,
    })),
  }));

  if (dryRun) {
    console.log(
      `Prepared 1 homepage document and ${shopPageDocuments.length} shop page documents for Sanity dataset "${dataset}".`,
    );
    return;
  }

  let transaction = sanityClient.transaction().createOrReplace(homePageDocument);

  for (const document of shopPageDocuments) {
    transaction = transaction.createOrReplace(document);
  }

  await transaction.commit();

  console.log(
    `Migrated homepage and ${shopPageDocuments.length} shop page documents to Sanity dataset "${dataset}".`,
  );
}

main()
  .catch((error) => {
    if (isInsufficientPermissionsError(error)) {
      const missingPermissions = [
        ...new Set(
          error.details?.items
            ?.map((item) => item.error?.permission)
            .filter((permission): permission is string => Boolean(permission)) ?? [],
        ),
      ];

      const permissionSummary =
        missingPermissions.length > 0
          ? missingPermissions.join(", ")
          : "create / update";

      console.error(
        [
          `Sanity rejected the migration because SANITY_API_WRITE_TOKEN is missing document permissions for dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}".`,
          `Missing permission(s): ${permissionSummary}.`,
          "Use a Sanity API token or role that can create and update documents in this dataset.",
          'The first migration uses create-or-replace for new docs like "homePage" and "shopPage-*", so a read-only token will fail even if dry-run works.',
        ].join("\n"),
      );
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
