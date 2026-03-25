import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {prisma} from "@/lib/prisma";
import { getStorefrontAdminData } from "@/lib/storefront";

const sectionKeys = ["category", "trending", "arrival", "gender"] as const;
const slugPattern = /^[a-z0-9-]+$/;

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function numberValue(value: unknown) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function isValidPath(value: string) {
  return value.startsWith("/");
}

function isValidImageSource(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  );
}

function isDataImageSource(value: string) {
  return value.startsWith("data:image/");
}

async function persistImageSource(
  value: unknown,
  uploads: Map<string, Promise<string>>,
) {
  const normalized = text(value);

  if (!normalized || !isDataImageSource(normalized)) {
    return normalized;
  }

  let upload = uploads.get(normalized);

  if (!upload) {
    upload = uploadImage(normalized, { folder: "storefront" });
    uploads.set(normalized, upload);
  }

  return upload;
}

async function persistOptionalImageSource(
  value: unknown,
  uploads: Map<string, Promise<string>>,
) {
  const normalized = optionalText(value);

  if (!normalized) {
    return null;
  }

  return persistImageSource(normalized, uploads);
}

function validationResponse(errors: string[]) {
  return NextResponse.json(
    { error: errors.slice(0, 5).join(" ") },
    { status: 400 },
  );
}

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return unauthorizedResponse();
  }

  const data = await getStorefrontAdminData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const payload = await request.json();
    const heroSlides = Array.isArray(payload.heroSlides) ? payload.heroSlides : [];
    const homepageSections = Array.isArray(payload.homepageSections)
      ? payload.homepageSections
      : [];
    const homepageCards =
      payload.homepageCards && typeof payload.homepageCards === "object"
        ? payload.homepageCards
        : {};
    const shopPages = Array.isArray(payload.shopPages) ? payload.shopPages : [];
    const errors: string[] = [];
    const seenSlugs = new Set<string>();

    if (heroSlides.length === 0) {
      errors.push("Add at least one hero slide.");
    }

    for (const key of sectionKeys) {
      const section = homepageSections.find(
        (item: { key?: string }) => item?.key === key,
      );
      const title = text(section?.title);

      if (!title) {
        errors.push(`The ${key} section needs a title.`);
      }

      const cards = Array.isArray(homepageCards[key]) ? homepageCards[key] : [];

      cards.forEach((card: Record<string, unknown>, index: number) => {
        if (!text(card.title)) {
          errors.push(`${key} card ${index + 1} needs a title.`);
        }

        const link = text(card.link);
        if (!isValidPath(link)) {
          errors.push(`${key} card ${index + 1} needs an internal link starting with '/'.`);
        }

        const image = text(card.image);
        if (image && !isValidImageSource(image)) {
          errors.push(`${key} card ${index + 1} has an invalid image source.`);
        }
      });
    }

    heroSlides.forEach((slide: Record<string, unknown>, index: number) => {
      const imageUrl = text(slide.imageUrl);
      const ctaHref = text(slide.ctaHref) || "/shop/jewellery";

      if (!imageUrl || !isValidImageSource(imageUrl)) {
        errors.push(`Hero slide ${index + 1} needs a valid image.`);
      }

      if (!isValidPath(ctaHref)) {
        errors.push(`Hero slide ${index + 1} needs an internal CTA path.`);
      }
    });

    shopPages.forEach((page: Record<string, unknown>, index: number) => {
      const slug = text(page.slug);

      if (!slugPattern.test(slug)) {
        errors.push(`Shop page ${index + 1} needs a lowercase slug with hyphens only.`);
      } else if (seenSlugs.has(slug)) {
        errors.push(`Duplicate shop slug "${slug}" detected.`);
      } else {
        seenSlugs.add(slug);
      }

      if (!text(page.title)) {
        errors.push(`Shop page ${slug || index + 1} needs a title.`);
      }

      if (!text(page.heroTitle)) {
        errors.push(`Shop page ${slug || index + 1} needs a hero title.`);
      }

      const heroImageUrl = text(page.heroImageUrl);
      if (heroImageUrl && !isValidImageSource(heroImageUrl)) {
        errors.push(`Shop page ${slug || index + 1} has an invalid hero image.`);
      }

      const heroCtaHref = text(page.heroCtaHref) || "/shop/jewellery";
      if (!isValidPath(heroCtaHref)) {
        errors.push(`Shop page ${slug || index + 1} needs an internal hero CTA path.`);
      }

      if (numberValue(page.resultCount) < 0) {
        errors.push(`Shop page ${slug || index + 1} cannot have a negative result count.`);
      }

      const features = Array.isArray(page.features) ? page.features : [];
      const products = Array.isArray(page.products) ? page.products : [];

      features.forEach((feature: Record<string, unknown>, featureIndex: number) => {
        if (!text(feature.title)) {
          errors.push(`Feature ${featureIndex + 1} on ${slug || "a shop page"} needs a title.`);
        }

        const imageUrl = text(feature.imageUrl);
        if (!imageUrl || !isValidImageSource(imageUrl)) {
          errors.push(`Feature ${featureIndex + 1} on ${slug || "a shop page"} needs a valid image.`);
        }

        const href = text(feature.href);
        if (!isValidPath(href)) {
          errors.push(`Feature ${featureIndex + 1} on ${slug || "a shop page"} needs an internal path.`);
        }
      });

      products.forEach((product: Record<string, unknown>, productIndex: number) => {
        if (!text(product.name)) {
          errors.push(`Product ${productIndex + 1} on ${slug || "a shop page"} needs a name.`);
        }

        const imageUrl = text(product.imageUrl);
        if (imageUrl && !isValidImageSource(imageUrl)) {
          errors.push(`Product ${productIndex + 1} on ${slug || "a shop page"} has an invalid image.`);
        }

        if (numberValue(product.price) < 0) {
          errors.push(`Product ${productIndex + 1} on ${slug || "a shop page"} cannot have a negative price.`);
        }
      });
    });

    for (const key of sectionKeys) {
      const section = homepageSections.find(
        (item: { key?: string }) => item?.key === key,
      );
      const backgroundImageUrl = optionalText(section?.backgroundImageUrl);

      if (backgroundImageUrl && !isValidImageSource(backgroundImageUrl)) {
        errors.push(`${key} section has an invalid background image.`);
      }
    }

    if (errors.length > 0) {
      return validationResponse(errors);
    }

    const imageUploads = new Map<string, Promise<string>>();
    const persistedHeroSlides = await Promise.all(
      heroSlides.map(async (slide: Record<string, unknown>) => ({
        ...slide,
        imageUrl: await persistImageSource(slide.imageUrl, imageUploads),
      })),
    );
    const persistedHomepageSections = await Promise.all(
      homepageSections.map(async (section: Record<string, unknown>) => ({
        ...section,
        backgroundImageUrl: await persistOptionalImageSource(
          section.backgroundImageUrl,
          imageUploads,
        ),
      })),
    );
    const persistedHomepageCards = {
      category: await Promise.all(
        (Array.isArray(homepageCards.category) ? homepageCards.category : []).map(
          async (card: Record<string, unknown>) => ({
            ...card,
            image: await persistOptionalImageSource(card.image, imageUploads),
          }),
        ),
      ),
      trending: await Promise.all(
        (Array.isArray(homepageCards.trending) ? homepageCards.trending : []).map(
          async (card: Record<string, unknown>) => ({
            ...card,
            image: await persistOptionalImageSource(card.image, imageUploads),
          }),
        ),
      ),
      arrival: await Promise.all(
        (Array.isArray(homepageCards.arrival) ? homepageCards.arrival : []).map(
          async (card: Record<string, unknown>) => ({
            ...card,
            image: await persistOptionalImageSource(card.image, imageUploads),
          }),
        ),
      ),
      gender: await Promise.all(
        (Array.isArray(homepageCards.gender) ? homepageCards.gender : []).map(
          async (card: Record<string, unknown>) => ({
            ...card,
            image: await persistOptionalImageSource(card.image, imageUploads),
          }),
        ),
      ),
    } satisfies Record<(typeof sectionKeys)[number], Record<string, unknown>[]>;
    const persistedShopPages = await Promise.all(
      shopPages.map(async (page: Record<string, unknown>) => {
        const features = Array.isArray(page.features) ? page.features : [];
        const products = Array.isArray(page.products) ? page.products : [];

        return {
          ...page,
          heroImageUrl: await persistOptionalImageSource(
            page.heroImageUrl,
            imageUploads,
          ),
          features: await Promise.all(
            features.map(async (feature: Record<string, unknown>) => ({
              ...feature,
              imageUrl: await persistImageSource(feature.imageUrl, imageUploads),
            })),
          ),
          products: await Promise.all(
            products.map(async (product: Record<string, unknown>) => ({
              ...product,
              imageUrl: await persistOptionalImageSource(
                product.imageUrl,
                imageUploads,
              ),
            })),
          ),
        };
      }),
    );

    const normalizedHeroSlides = persistedHeroSlides.map(
      (slide: Record<string, unknown>, index: number) => ({
        imageUrl: text(slide.imageUrl) || "/images/sbg-women.jpg",
        badge: optionalText(slide.badge),
        title: optionalText(slide.title),
        subtitle: optionalText(slide.subtitle),
        ctaLabel: optionalText(slide.ctaLabel),
        ctaHref: optionalText(slide.ctaHref),
        order: numberValue(slide.order) || index + 1,
      }),
    );
    const normalizedHomepageSections = sectionKeys.map((key) => {
      const section = persistedHomepageSections.find(
        (item: { key?: string }) => item?.key === key,
      );

      return {
        key,
        eyebrow: optionalText(section?.eyebrow),
        title: text(section?.title) || key,
        subtitle: optionalText(section?.subtitle),
        description: optionalText(section?.description),
        ctaLabel: optionalText(section?.ctaLabel),
        ctaHref: optionalText(section?.ctaHref),
        backgroundImageUrl: optionalText(section?.backgroundImageUrl),
      };
    });

    const normalizedCuratedItems = sectionKeys.flatMap((key) => {
      const cards = Array.isArray(persistedHomepageCards[key])
        ? persistedHomepageCards[key]
        : [];

      return cards.map((card: Record<string, unknown>, index: number) => ({
        section: key,
        title: text(card.title) || "Untitled card",
        subtitle: optionalText(card.subtitle),
        image: optionalText(card.image),
        link: text(card.link) || "/shop/jewellery",
        badge: optionalText(card.badge),
        order: numberValue(card.order) || index + 1,
      }));
    });

    const normalizedShopPages = persistedShopPages.map(
      (page: Record<string, unknown>) => {
        const slug = text(page.slug) || "jewellery";
        const features = Array.isArray(page.features) ? page.features : [];
        const products = Array.isArray(page.products) ? page.products : [];

        return {
          slug,
          title: text(page.title) || "Untitled page",
          subtitle: text(page.subtitle),
          heroEyebrow: optionalText(page.heroEyebrow),
          heroTitle: text(page.heroTitle) || "Untitled hero",
          heroDescription: text(page.heroDescription),
          heroImageUrl: optionalText(page.heroImageUrl),
          heroCtaLabel: text(page.heroCtaLabel) || "Shop Now",
          heroCtaHref: text(page.heroCtaHref) || "/shop/jewellery",
          resultCount: numberValue(page.resultCount),
          features: features.map(
            (feature: Record<string, unknown>, index: number) => ({
              title: text(feature.title) || "Untitled feature",
              imageUrl: text(feature.imageUrl) || "/images/sbg-women.jpg",
              href: text(feature.href) || `/shop/${slug}`,
              order: numberValue(feature.order) || index + 1,
            }),
          ),
          products: products.map(
            (product: Record<string, unknown>, index: number) => ({
              name: text(product.name) || "Untitled product",
              price: numberValue(product.price),
              imageUrl: optionalText(product.imageUrl),
              badge: optionalText(product.badge),
              lowStockText: optionalText(product.lowStockText),
              order: numberValue(product.order) || index + 1,
            }),
          ),
        };
      },
    );

    const transactionOperations = [
      prisma.homepageSection.deleteMany(),
      prisma.homepageSection.createMany({
        data: normalizedHomepageSections,
      }),
      prisma.slider.deleteMany(),
      ...(normalizedHeroSlides.length > 0
        ? [
            prisma.slider.createMany({
              data: normalizedHeroSlides,
            }),
          ]
        : []),
      prisma.curatedItem.deleteMany(),
      ...(normalizedCuratedItems.length > 0
        ? [
            prisma.curatedItem.createMany({
              data: normalizedCuratedItems,
            }),
          ]
        : []),
      ...normalizedShopPages.map((page) =>
        prisma.shopPage.upsert({
          where: { slug: page.slug },
          update: {
            title: page.title,
            subtitle: page.subtitle,
            heroEyebrow: page.heroEyebrow,
            heroTitle: page.heroTitle,
            heroDescription: page.heroDescription,
            heroImageUrl: page.heroImageUrl,
            heroCtaLabel: page.heroCtaLabel,
            heroCtaHref: page.heroCtaHref,
            resultCount: page.resultCount,
            features: page.features.length > 0
              ? {
                  deleteMany: {},
                  create: page.features,
                }
              : {
                  deleteMany: {},
                },
            products: page.products.length > 0
              ? {
                  deleteMany: {},
                  create: page.products,
                }
              : {
                  deleteMany: {},
                },
          },
          create: {
            slug: page.slug,
            title: page.title,
            subtitle: page.subtitle,
            heroEyebrow: page.heroEyebrow,
            heroTitle: page.heroTitle,
            heroDescription: page.heroDescription,
            heroImageUrl: page.heroImageUrl,
            heroCtaLabel: page.heroCtaLabel,
            heroCtaHref: page.heroCtaHref,
            resultCount: page.resultCount,
            ...(page.features.length > 0
              ? {
                  features: {
                    create: page.features,
                  },
                }
              : {}),
            ...(page.products.length > 0
              ? {
                  products: {
                    create: page.products,
                  },
                }
              : {}),
          },
        }),
      ),
    ];

    await prisma.$transaction(transactionOperations);

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/dashboard/storefront");

    for (const page of normalizedShopPages) {
      revalidatePath(`/shop/${page.slug}`);
    }

    const refreshed = await getStorefrontAdminData();
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error("Failed to save storefront content.", error);

    return NextResponse.json(
      { error: "Failed to save storefront content. Please try again." },
      { status: 500 },
    );
  }
}
