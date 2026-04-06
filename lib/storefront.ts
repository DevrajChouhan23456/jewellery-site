import type {
  CuratedItem,
  HomepageSection as HomepageSectionModel,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

  return {
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
  };
}

export async function getStorefrontAdminData() {
  const [heroSlides, homepageSections, curatedItems, shopPages]: [
    HeroSlideRecord[],
    HomepageSectionModel[],
    CuratedItem[],
    ShopPageRecord[],
  ] =
    await Promise.all([
      prisma.slider.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: heroSlideSelect,
      }),
      prisma.homepageSection.findMany({
        orderBy: { key: "asc" },
      }),
      prisma.curatedItem.findMany({
        orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      }),
      prisma.shopPage.findMany({
        orderBy: { title: "asc" },
        select: shopPageSelect,
      }),
    ]);

  return {
    heroSlides: heroSlides.map(normalizeHeroSlide),
    homepageSections: (
      ["category", "trending", "arrival", "gender"] as HomepageSectionKey[]
    ).map((key) =>
      normalizeHomepageSection(
        key,
        homepageSections.find((section: HomepageSectionModel) => section.key === key),
      ),
    ),
    homepageCards: {
      category: curatedItems
        .filter((item: CuratedItem) => item.section === "category")
        .map((item: CuratedItem) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          image: item.image ?? null,
          link: item.link,
          badge: item.badge ?? null,
          order: item.order,
        })),
      trending: curatedItems
        .filter((item: CuratedItem) => item.section === "trending")
        .map((item: CuratedItem) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          image: item.image ?? null,
          link: item.link,
          badge: item.badge ?? null,
          order: item.order,
        })),
      arrival: curatedItems
        .filter((item: CuratedItem) => item.section === "arrival")
        .map((item: CuratedItem) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          image: item.image ?? null,
          link: item.link,
          badge: item.badge ?? null,
          order: item.order,
        })),
      gender: curatedItems
        .filter((item: CuratedItem) => item.section === "gender")
        .map((item: CuratedItem) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          image: item.image ?? null,
          link: item.link,
          badge: item.badge ?? null,
          order: item.order,
        })),
    },
    shopPages: shopPages.map((page: ShopPageRecord) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle,
      heroEyebrow: page.heroEyebrow ?? "",
      heroTitle: page.heroTitle,
      heroDescription: page.heroDescription,
      heroImageUrl: page.heroImageUrl ?? "",
      heroCtaLabel: page.heroCtaLabel,
      heroCtaHref: page.heroCtaHref,
      resultCount: page.resultCount,
      features: page.features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        imageUrl: feature.imageUrl,
        href: feature.href,
        order: feature.order,
      })),
      products: page.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl ?? "",
        badge: product.badge ?? "",
        lowStockText: product.lowStockText ?? "",
        order: product.order,
      })),
    })),
  };
}

export async function getShopPageData(slug: string) {
  const page = await prisma.shopPage.findUnique({
    where: { slug },
    select: shopPageSelect,
  });

  // ✅ IF CMS PAGE EXISTS → USE IT
  if (page) return page;

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
  return {
    id: `fallback-${slug}`,
    slug,
    title: slug,
    subtitle: "",
    heroEyebrow: "",
    heroTitle: `${slug} Jewellery`,
    heroDescription: `Explore ${slug} jewellery collection`,
    heroImageUrl: products[0]?.images?.[0] ?? "",
    heroCtaLabel: "Shop Now",
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
  };
}

export async function getFilteredProducts({
  slug,
  page = 1,
  sort,
  minPrice,
  maxPrice,
  materials,
  categories,
}: any) {
  console.log('[DEBUG] getFilteredProducts called with:', { slug, page, sort, minPrice, maxPrice, materials, categories: categories?.length });

  const where: any = {};

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
