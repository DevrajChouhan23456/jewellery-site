import { z } from "zod";

const sectionKeys = ["category", "trending", "arrival", "gender"] as const;

const textFieldSchema = z.union([z.string(), z.number()]).transform(String);
const nullableTextFieldSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => (value === null ? null : String(value)));
const numberFieldSchema = z.coerce.number().catch(0);

const heroSlideSchema = z
  .object({
    imageUrl: textFieldSchema.optional(),
    badge: textFieldSchema.optional(),
    title: textFieldSchema.optional(),
    subtitle: textFieldSchema.optional(),
    ctaLabel: textFieldSchema.optional(),
    ctaHref: textFieldSchema.optional(),
    order: numberFieldSchema.optional(),
  })
  .passthrough();

const homepageSectionSchema = z
  .object({
    key: z.enum(sectionKeys),
    eyebrow: textFieldSchema.optional(),
    title: textFieldSchema.optional(),
    subtitle: textFieldSchema.optional(),
    description: textFieldSchema.optional(),
    ctaLabel: textFieldSchema.optional(),
    ctaHref: textFieldSchema.optional(),
    backgroundImageUrl: nullableTextFieldSchema.optional(),
  })
  .passthrough();

const homepageCardSchema = z
  .object({
    title: textFieldSchema.optional(),
    subtitle: textFieldSchema.optional(),
    image: nullableTextFieldSchema.optional(),
    link: textFieldSchema.optional(),
    badge: nullableTextFieldSchema.optional(),
    order: numberFieldSchema.optional(),
  })
  .passthrough();

const shopFeatureSchema = z
  .object({
    title: textFieldSchema.optional(),
    imageUrl: textFieldSchema.optional(),
    href: textFieldSchema.optional(),
    order: numberFieldSchema.optional(),
  })
  .passthrough();

const shopProductSchema = z
  .object({
    name: textFieldSchema.optional(),
    price: numberFieldSchema.optional(),
    imageUrl: nullableTextFieldSchema.optional(),
    badge: nullableTextFieldSchema.optional(),
    lowStockText: nullableTextFieldSchema.optional(),
    order: numberFieldSchema.optional(),
  })
  .passthrough();

const shopPageSchema = z
  .object({
    slug: textFieldSchema.optional(),
    title: textFieldSchema.optional(),
    subtitle: textFieldSchema.optional(),
    heroEyebrow: textFieldSchema.optional(),
    heroTitle: textFieldSchema.optional(),
    heroDescription: textFieldSchema.optional(),
    heroImageUrl: nullableTextFieldSchema.optional(),
    heroCtaLabel: textFieldSchema.optional(),
    heroCtaHref: textFieldSchema.optional(),
    resultCount: numberFieldSchema.optional(),
    features: z.array(shopFeatureSchema).optional(),
    products: z.array(shopProductSchema).optional(),
  })
  .passthrough();

export const storefrontRequestSchema = z
  .object({
    heroSlides: z.array(heroSlideSchema),
    homepageSections: z.array(homepageSectionSchema),
    homepageCards: z
      .object({
        category: z.array(homepageCardSchema).default([]),
        trending: z.array(homepageCardSchema).default([]),
        arrival: z.array(homepageCardSchema).default([]),
        gender: z.array(homepageCardSchema).default([]),
      })
      .passthrough(),
    shopPages: z.array(shopPageSchema),
  })
  .passthrough();
