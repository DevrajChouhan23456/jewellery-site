import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

  if (errors.length > 0) {
    return validationResponse(errors);
  }

  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    for (const key of sectionKeys) {
      const section = homepageSections.find(
        (item: { key?: string }) => item?.key === key,
      );

      await transaction.homepageSection.upsert({
        where: { key },
        update: {
          eyebrow: optionalText(section?.eyebrow),
          title: text(section?.title) || key,
          subtitle: optionalText(section?.subtitle),
          description: optionalText(section?.description),
          ctaLabel: optionalText(section?.ctaLabel),
          ctaHref: optionalText(section?.ctaHref),
        },
        create: {
          key,
          eyebrow: optionalText(section?.eyebrow),
          title: text(section?.title) || key,
          subtitle: optionalText(section?.subtitle),
          description: optionalText(section?.description),
          ctaLabel: optionalText(section?.ctaLabel),
          ctaHref: optionalText(section?.ctaHref),
        },
      });
    }

    await transaction.slider.deleteMany();

    if (heroSlides.length > 0) {
      await transaction.slider.createMany({
        data: heroSlides.map((slide: Record<string, unknown>, index: number) => ({
          imageUrl: text(slide.imageUrl) || "/images/sbg-women.jpg",
          badge: optionalText(slide.badge),
          title: optionalText(slide.title),
          subtitle: optionalText(slide.subtitle),
          ctaLabel: optionalText(slide.ctaLabel),
          ctaHref: optionalText(slide.ctaHref),
          order: numberValue(slide.order) || index + 1,
        })),
      });
    }

    await transaction.curatedItem.deleteMany();

    const curatedData = sectionKeys.flatMap((key) => {
      const cards = Array.isArray(homepageCards[key]) ? homepageCards[key] : [];

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

    if (curatedData.length > 0) {
      await transaction.curatedItem.createMany({
        data: curatedData,
      });
    }

    for (const page of shopPages) {
      const slug = text(page.slug) || "jewellery";

      const shopPage = await transaction.shopPage.upsert({
        where: { slug },
        update: {
          title: text(page.title) || "Untitled page",
          subtitle: text(page.subtitle),
          heroEyebrow: optionalText(page.heroEyebrow),
          heroTitle: text(page.heroTitle) || "Untitled hero",
          heroDescription: text(page.heroDescription),
          heroImageUrl: optionalText(page.heroImageUrl),
          heroCtaLabel: text(page.heroCtaLabel) || "Shop Now",
          heroCtaHref: text(page.heroCtaHref) || "/shop/jewellery",
          resultCount: numberValue(page.resultCount),
        },
        create: {
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
        },
      });

      await transaction.shopPageFeature.deleteMany({
        where: { shopPageId: shopPage.id },
      });
      await transaction.shopPageProduct.deleteMany({
        where: { shopPageId: shopPage.id },
      });

      const features = Array.isArray(page.features) ? page.features : [];
      const products = Array.isArray(page.products) ? page.products : [];

      if (features.length > 0) {
        await transaction.shopPageFeature.createMany({
          data: features.map(
            (feature: Record<string, unknown>, index: number) => ({
              shopPageId: shopPage.id,
              title: text(feature.title) || "Untitled feature",
              imageUrl: text(feature.imageUrl) || "/images/sbg-women.jpg",
              href: text(feature.href) || `/shop/${slug}`,
              order: numberValue(feature.order) || index + 1,
            }),
          ),
        });
      }

      if (products.length > 0) {
        await transaction.shopPageProduct.createMany({
          data: products.map(
            (product: Record<string, unknown>, index: number) => ({
              shopPageId: shopPage.id,
              name: text(product.name) || "Untitled product",
              price: numberValue(product.price),
              imageUrl: optionalText(product.imageUrl),
              badge: optionalText(product.badge),
              lowStockText: optionalText(product.lowStockText),
              order: numberValue(product.order) || index + 1,
            }),
          ),
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/storefront");

  for (const page of shopPages) {
    revalidatePath(`/shop/${text(page.slug) || "jewellery"}`);
  }

  const refreshed = await getStorefrontAdminData();
  return NextResponse.json(refreshed);
}
