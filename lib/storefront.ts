import type {
  CuratedItem,
  HomepageSection as HomepageSectionModel,
  Prisma,
} from "@prisma/client";

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
} from "@/lib/storefront-homepage-defaults";
import {
  getSanityHomepageContent,
  getSanityShopPageData,
} from "@/sanity/lib/storefront";

export type HomepageSectionKey =
  | "category"
  | "trending"
  | "arrival"
  | "gender";

export type HomepageCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  link: string;
  badge: string | null;
  order: number;
};

export type HomepageSectionContent = {
  id: string;
  key: HomepageSectionKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImageUrl?: string | null;
};

export type HeroSlideContent = {
  id: string;
  imageUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
};

const shopPageSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  heroEyebrow: true,
  heroTitle: true,
  heroDescription: true,
  heroImageUrl: true,
  heroCtaLabel: true,
  heroCtaHref: true,
  resultCount: true,
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
  products: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      imageUrl: true,
      badge: true,
      lowStockText: true,
      order: true,
    },
  },
} satisfies Prisma.ShopPageSelect;

export type ShopPageRecord = Prisma.ShopPageGetPayload<{
  select: typeof shopPageSelect;
}>;
export type ShopPageContent = ShopPageRecord | null;

const heroSlideSelect = {
  id: true,
  imageUrl: true,
  badge: true,
  title: true,
  subtitle: true,
  ctaLabel: true,
  ctaHref: true,
  order: true,
} satisfies Prisma.SliderSelect;

type HeroSlideRecord = Prisma.SliderGetPayload<{
  select: typeof heroSlideSelect;
}>;

const defaultHomepageSections: Record<
  HomepageSectionKey,
  Omit<HomepageSectionContent, "id" | "key">
> = {
  category: {
    eyebrow: "",
    title: "Find Your Next Style Match",
    subtitle: "Shop by style and occasion",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
  trending: {
    eyebrow: "",
    title: "Trending This Season",
    subtitle: "Looks customers are styling right now",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
  arrival: {
    eyebrow: "Fresh Drops",
    title: "New Arrivals",
    subtitle: "",
    description:
      "New artificial jewellery drops for gifting, festive dressing, and easy everyday styling.",
    ctaLabel: "Explore Latest Drops",
    ctaHref: "/shop/jewellery",
  },
  gender: {
    eyebrow: "",
    title: "Curated For You",
    subtitle: "Shop by mood and styling need",
    description: "",
    ctaLabel: "",
    ctaHref: "",
  },
};

const homepageCardOverrides: Record<
  HomepageSectionKey,
  Array<Partial<Pick<HomepageCard, "title" | "subtitle" | "link" | "badge">>>
> = {
  category: [
    {
      title: "Earrings",
      subtitle: "Lightweight sparkle for daily outfits and party plans.",
      link: "/shop/earrings",
    },
    {
      title: "Rings",
      subtitle: "Adjustable, stackable, and statement styles made to mix.",
      link: "/shop/rings",
    },
    {
      title: "Necklace Sets",
      subtitle: "Layered sets that finish saree, suit, and lehenga looks.",
      link: "/shop/jewellery",
    },
    {
      title: "Bridal Sets",
      subtitle: "Big-day glam without the real-gold spend.",
      link: "/shop/jewellery",
    },
    {
      title: "Bracelets",
      subtitle: "Charms and cuffs for easy styling from day to night.",
      link: "/shop/jewellery",
    },
    {
      title: "Bangles",
      subtitle: "Gold-tone and oxidised stacks for festive dressing.",
      link: "/shop/jewellery",
    },
    {
      title: "Pendants",
      subtitle: "Simple styles for gifting and everyday wear.",
      link: "/shop/jewellery",
    },
    {
      title: "View All",
      subtitle: "Artificial jewellery styles for every mood",
      link: "/shop/jewellery",
      badge: "Shop",
    },
  ],
  trending: [
    {
      title: "Wedding Guest Glam",
      subtitle: "Statement sparkle for reception fits, sangeet looks, and festive dressing.",
      link: "/shop/jewellery",
    },
    {
      title: "Gift-Ready Picks",
      subtitle: "Budget-friendly pieces that still feel celebratory and polished.",
      link: "/shop/gifting",
    },
    {
      title: "Daily Wear Edit",
      subtitle: "Lightweight styles that move easily from office hours to dinner plans.",
      link: "/shop/glamdays",
    },
  ],
  arrival: [
    {
      title: "New Kundan Sets",
      subtitle: "Fresh festive drops for wedding season and dressy celebrations.",
      link: "/shop/jewellery",
    },
    {
      title: "Fresh Minimal Picks",
      subtitle: "Easy everyday sparkle with lightweight styling appeal.",
      link: "/shop/glamdays",
    },
  ],
  gender: [
    {
      title: "For Her",
      subtitle: "Layered sets, statement sparkle, and easy styling favourites.",
      link: "/shop/jewellery",
    },
    {
      title: "For Him",
      subtitle: "Bold chains, rings, and gifting picks with a modern edge.",
      link: "/shop/jewellery",
    },
    {
      title: "For Kids",
      subtitle: "Playful gifting styles with lightweight finishes and soft shine.",
      link: "/shop/jewellery",
    },
  ],
};

const heroSlideOverrides: Array<
  Pick<HeroSlideContent, "badge" | "title" | "subtitle" | "ctaLabel" | "ctaHref">
> = [
  {
    badge: "Floral Party Edit",
    title: "Floral sparkle for party-ready styling",
    subtitle:
      "Lightweight statement pieces for brunch fits, mehendi nights, and festive dressing.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/earrings",
  },
  {
    badge: "Gold-Tone Layers",
    title: "Gold-tone layers without the real-gold price tag",
    subtitle:
      "Build festive looks with stackable bangles, layered chains, and occasion-ready sets.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/jewellery",
  },
  {
    badge: "American Diamond Edit",
    title: "American Diamond shine for gifting and occasions",
    subtitle:
      "Choose polished pendants, rings, and earrings that bring instant sparkle to every event look.",
    ctaLabel: "Shop edit",
    ctaHref: "/shop/jewellery",
  },
];

const shopPageOverrides = {
  jewellery: {
    title: "All Jewellery",
    subtitle: "Explore our full edit of artificial jewellery.",
    heroEyebrow: "Signature Style Edits",
    heroTitle: "Find artificial jewellery for festive looks, gifting, and everyday glam.",
    heroDescription:
      "Browse earrings, rings, necklace sets, bangles, gifting picks, and occasion-ready styles curated for modern Indian dressing.",
    heroCtaLabel: "Explore All Jewellery",
    featureTitles: ["Earrings", "Necklace Sets", "Rings", "Gift Sets"],
  },
  gold: {
    title: "Gold-Tone",
    subtitle: "Gold-tone fashion jewellery with festive shine.",
    heroEyebrow: "Gold-Tone Edit",
    heroTitle: "Gold-tone pieces that bring wedding and festive outfits to life.",
    heroDescription:
      "Browse necklace sets, bangles, earrings, and layered styles designed for celebration looks and budget-friendly styling.",
    heroCtaLabel: "Shop Gold-Tone",
    featureTitles: ["Daily Wear", "Gifting", "Bridal Sets", "Layered Chains"],
  },
  diamond: {
    title: "American Diamond",
    subtitle: "American Diamond sparkle for parties, gifting, and occasion wear.",
    heroEyebrow: "Statement Sparkle",
    heroTitle: "American Diamond styles made for polished event dressing.",
    heroDescription:
      "Build your look with sparkling pendants, earrings, rings, and gifting favourites that bring instant shine without feeling heavy.",
    heroCtaLabel: "Explore Sparkle",
    featureTitles: ["Earrings", "Pendants", "Rings", "Gift Picks"],
  },
  earrings: {
    title: "Earrings",
    subtitle: "Studs, drops, hoops, and festive jhumkas for every plan.",
    heroEyebrow: "Ear Candy",
    heroTitle: "Statement earrings that frame every look with easy sparkle.",
    heroDescription:
      "Discover party drops, floral accents, gold-tone hoops, and gifting-friendly silhouettes designed for effortless styling.",
    heroCtaLabel: "Shop Earrings",
    featureTitles: ["Studs", "Drops", "Hoops", "Bridal Glam"],
  },
  rings: {
    title: "Rings",
    subtitle: "Adjustable rings for gifting, stacking, and personal style.",
    heroEyebrow: "Stack And Style",
    heroTitle: "Find rings that feel playful, polished, and easy to wear.",
    heroDescription:
      "From cocktail rings to stackable styles, explore sculpted silhouettes designed for gifting and occasion dressing.",
    heroCtaLabel: "Shop Rings",
    featureTitles: ["Daily Rings", "Occasion Rings", "Couple Rings", "Gold-Tone Rings"],
  },
  gifting: {
    title: "Gifting",
    subtitle: "Thoughtful jewellery gifts for heartfelt milestones.",
    heroEyebrow: "Gift With Sparkle",
    heroTitle: "From birthdays to bridesmaid boxes, choose a gift that feels special.",
    heroDescription:
      "Explore keepsakes, festive picks, daily-wear styles, and memorable gifting edits curated for every celebration.",
    heroCtaLabel: "Explore Gifts",
    featureTitles: ["Birthday Gifts", "Return Gifts", "For Him", "For Her"],
  },
  glamdays: {
    title: "Daily Wear",
    subtitle: "Lightweight sparkle for polished everyday styling.",
    heroEyebrow: "Everyday Icons",
    heroTitle: "Daily-wear jewellery that feels easy, modern, and outfit-friendly.",
    heroDescription:
      "Choose sleek pendants, stackable rings, versatile earrings, and subtle accents designed to move with your routine.",
    heroCtaLabel: "Shop Daily Wear",
    featureTitles: ["Stackables", "Everyday Chains", "Subtle Studs", "Office Edit"],
  },
  thejoydressing: {
    title: "Collections",
    subtitle: "Curated artificial jewellery stories with a distinct point of view.",
    heroEyebrow: "Collection Stories",
    heroTitle: "Explore signature edits designed around mood, moment, and styling.",
    heroDescription:
      "Dive into floral stories, gifting edits, American Diamond sparkle, and celebration-ready collections.",
    heroCtaLabel: "Explore Collections",
    featureTitles: ["Floral Bloom", "Sparkle Edit", "Festive Gold-Tone", "Joyful Gifting"],
  },
} as const;

function normalizeHomepageSection(
  key: HomepageSectionKey,
  section?: {
    id: string;
    key: string;
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
    id: section?.id ?? `default-${key}`,
    key,
    eyebrow: section?.eyebrow ?? fallback.eyebrow,
    title: section?.title ?? fallback.title,
    subtitle: section?.subtitle ?? fallback.subtitle,
    description: section?.description ?? fallback.description,
    ctaLabel: section?.ctaLabel ?? fallback.ctaLabel,
    ctaHref: section?.ctaHref ?? fallback.ctaHref,
    backgroundImageUrl: section?.backgroundImageUrl ?? undefined,
  } satisfies HomepageSectionContent;
}

function normalizeHeroSlide(
  slide: HeroSlideRecord,
) {
  return {
    id: slide.id,
    imageUrl: slide.imageUrl,
    badge: slide.badge ?? "Signature Edit",
    title: slide.title ?? "Discover modern jewellery for every moment",
    subtitle:
      slide.subtitle ??
      "From everyday gold to celebration-ready diamonds, explore pieces that feel refined, expressive, and made to be remembered.",
    ctaLabel: slide.ctaLabel ?? "Shop Now",
    ctaHref: slide.ctaHref ?? "/shop/jewellery",
    order: slide.order,
  } satisfies HeroSlideContent;
}

function applyHomepageCardOverrides(
  section: HomepageSectionKey,
  items: HomepageCard[],
) {
  const overrides = homepageCardOverrides[section];

  return items.map((item, index) => {
    const override = overrides[index];

    if (!override) {
      return item;
    }

    return {
      ...item,
      title: override.title ?? item.title,
      subtitle: override.subtitle ?? item.subtitle,
      link: override.link ?? item.link,
      badge: override.badge ?? item.badge,
    };
  });
}

function applyHomepageBranding(content: {
  categories: HomepageCard[];
  trending: HomepageCard[];
  arrivals: HomepageCard[];
  gender: HomepageCard[];
  heroSlides: HeroSlideContent[];
  sections: Record<HomepageSectionKey, HomepageSectionContent>;
  servicePillars: typeof defaultServicePillars;
  reassuranceHighlights: typeof defaultReassuranceHighlights;
  conciergeEyebrow: string;
  conciergeTitle: string;
  conciergeActions: typeof defaultConciergeActions;
  stylingJournalEyebrow: string;
  stylingJournalTitle: string;
  stylingTips: string[];
}) {
  return {
    ...content,
    categories: applyHomepageCardOverrides("category", content.categories),
    trending: applyHomepageCardOverrides("trending", content.trending),
    arrivals: applyHomepageCardOverrides("arrival", content.arrivals),
    gender: applyHomepageCardOverrides("gender", content.gender),
    heroSlides: content.heroSlides.map((slide, index) => ({
      ...slide,
      ...(heroSlideOverrides[index] ?? {}),
    })),
    sections: {
      category: { ...content.sections.category, ...defaultHomepageSections.category },
      trending: { ...content.sections.trending, ...defaultHomepageSections.trending },
      arrival: { ...content.sections.arrival, ...defaultHomepageSections.arrival },
      gender: { ...content.sections.gender, ...defaultHomepageSections.gender },
    },
    servicePillars: defaultServicePillars.map((item) => ({ ...item })),
    reassuranceHighlights: defaultReassuranceHighlights.map((item) => ({
      ...item,
    })),
    conciergeEyebrow: defaultConciergeEyebrow,
    conciergeTitle: defaultConciergeTitle,
    conciergeActions: defaultConciergeActions.map((item) => ({ ...item })),
    stylingJournalEyebrow: defaultStylingJournalEyebrow,
    stylingJournalTitle: defaultStylingJournalTitle,
    stylingTips: [...defaultStylingTips],
  };
}

function applyShopPageBranding<
  T extends {
    slug: string;
    features?: Array<{ title: string }>;
  },
>(page: T) {
  const override =
    shopPageOverrides[page.slug as keyof typeof shopPageOverrides];

  if (!override) {
    return page;
  }

  return {
    ...page,
    title: override.title,
    subtitle: override.subtitle,
    heroEyebrow: override.heroEyebrow,
    heroTitle: override.heroTitle,
    heroDescription: override.heroDescription,
    heroCtaLabel: override.heroCtaLabel,
    features: page.features?.map((feature, index) => ({
        ...feature,
        title: override.featureTitles[index] ?? feature.title,
      })),
  };
}

export async function getHomepageCards(section: HomepageSectionKey) {
  const items: CuratedItem[] = await prisma.curatedItem.findMany({
    where: { section },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    image: item.image ?? null,
    link: item.link,
    badge: item.badge ?? null,
    order: item.order,
  })) satisfies HomepageCard[];
}

export async function getHomepageContent() {
  const sanityContent = await getSanityHomepageContent();

  if (sanityContent) {
    return applyHomepageBranding(sanityContent);
  }

  const [categories, trending, arrivals, gender, heroSlides, sectionRecords]: [
    HomepageCard[],
    HomepageCard[],
    HomepageCard[],
    HomepageCard[],
    HeroSlideRecord[],
    HomepageSectionModel[],
  ] =
    await Promise.all([
      getHomepageCards("category"),
      getHomepageCards("trending"),
      getHomepageCards("arrival"),
      getHomepageCards("gender"),
      prisma.slider.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: heroSlideSelect,
      }),
      prisma.homepageSection.findMany(),
    ]);

  const sectionMap = new Map(
    sectionRecords.map((section: HomepageSectionModel) => [
      section.key as HomepageSectionKey,
      normalizeHomepageSection(
        section.key as HomepageSectionKey,
        section,
      ),
    ]),
  );

  return applyHomepageBranding({
    categories,
    trending,
    arrivals,
    gender,
    heroSlides: heroSlides.map(normalizeHeroSlide),
    sections: {
      category: sectionMap.get("category") ?? normalizeHomepageSection("category"),
      trending:
        sectionMap.get("trending") ?? normalizeHomepageSection("trending"),
      arrival: sectionMap.get("arrival") ?? normalizeHomepageSection("arrival"),
      gender: sectionMap.get("gender") ?? normalizeHomepageSection("gender"),
    },
    servicePillars: defaultServicePillars.map((item) => ({ ...item })),
    reassuranceHighlights: defaultReassuranceHighlights.map((item) => ({
      ...item,
    })),
    conciergeEyebrow: defaultConciergeEyebrow,
    conciergeTitle: defaultConciergeTitle,
    conciergeActions: defaultConciergeActions.map((item) => ({ ...item })),
    stylingJournalEyebrow: defaultStylingJournalEyebrow,
    stylingJournalTitle: defaultStylingJournalTitle,
    stylingTips: [...defaultStylingTips],
  });
}

export async function getShopPageData(slug: string) {
  const sanityPage = await getSanityShopPageData(slug);

  if (sanityPage) {
    return applyShopPageBranding(sanityPage);
  }

  const page = await prisma.shopPage.findUnique({
    where: { slug },
    select: shopPageSelect,
  });

  // ✅ IF CMS PAGE EXISTS → USE IT
  if (page) return applyShopPageBranding(page);

  // 🔥 FALLBACK → FETCH PRODUCTS
  const products = await prisma.product.findMany({
    where: { 
      category: { 
        contains: slug, 
        mode: 'insensitive' 
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  // ✅ RETURN "FAKE CMS PAGE"
  return applyShopPageBranding({
    id: `fallback-${slug}`,
    slug,
    title: slug,
    subtitle: "",
    heroEyebrow: "",
    heroTitle: `${slug} edit`,
    heroDescription: `Explore the ${slug} fashion jewellery collection`,
    heroImageUrl: products[0]?.images?.[0] ?? "",
    heroCtaLabel: "Shop edit",
    heroCtaHref: `/shop/${slug}`,
    resultCount: products.length,
    features: [],
    products: products.map((p, index) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      imageUrl: p.images?.[0] ?? "",
      badge: "",
      lowStockText: "",
      order: index,
    })),
  });
}

export async function getFilteredProducts({
  slug,
  page = 1,
  sort,
  minPrice,
  maxPrice,
  materials,
  categories,
}: {
  slug?: string;
  page?: number;
  sort?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  materials?: string[];
  categories?: string[];
}) {
  console.log('[DEBUG] getFilteredProducts called with:', { slug, page, sort, minPrice, maxPrice, materials, categories: categories?.length });

  const where: Prisma.ProductWhereInput = {};

  if (slug && slug !== 'all') {
    where.category = { 
      contains: slug, 
      mode: 'insensitive' 
    };
    console.log('[DEBUG] Added category filter:', where.category);
  }

  if (minPrice || maxPrice) {
    where.price = {
      gte: minPrice ? Number(minPrice) : undefined,
      lte: maxPrice ? Number(maxPrice) : undefined,
    };
  }

  if (materials?.length) {
    where.material = { in: materials };
  }

  // Skip strict type filter for subcategory, use category only for now
  // if (categories?.length) {
  //   where.type = { 
  //     in: categories,
  //     mode: 'insensitive'
  //   };
  // }

  console.log('[DEBUG] Final where clause:', JSON.stringify(where, null, 2));

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const take = 9;
  const skip = (page - 1) * take;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  console.log('[DEBUG] Found products:', products.length, 'Total:', total);

  return { products, total };
}
