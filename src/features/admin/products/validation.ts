import { z } from "zod";

import { objectIdSchema } from "@/features/cart/validation";

const MAX_PRODUCT_NAME_LENGTH = 120;
const MAX_PRODUCT_SLUG_LENGTH = 80;
const MAX_TAXONOMY_VALUE_LENGTH = 60;
const MAX_PRODUCT_IMAGE_COUNT = 8;
const MAX_PRODUCT_IMAGE_LENGTH = 2_048;
const MAX_PRODUCT_PRICE = 10_000_000;

const productImagePrefixes = ["http://", "https://", "/"] as const;

function requiredText(label: string, maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`);
}

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer.`)
    .transform((value) => value || null);
}

export function toProductSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_PRODUCT_SLUG_LENGTH);
}

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(MAX_PRODUCT_SLUG_LENGTH, `Slug must be ${MAX_PRODUCT_SLUG_LENGTH} characters or fewer.`)
  .transform(toProductSlug)
  .refine(Boolean, "Slug is required.")
  .refine(
    (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Slug can contain only lowercase letters, numbers, and hyphens.",
  );

const taxonomySchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(
      MAX_TAXONOMY_VALUE_LENGTH,
      `${label} must be ${MAX_TAXONOMY_VALUE_LENGTH} characters or fewer.`,
    )
    .transform(toProductSlug)
    .refine(Boolean, `${label} is required.`);

const optionalTaxonomySchema = z
  .string()
  .trim()
  .max(
    MAX_TAXONOMY_VALUE_LENGTH,
    `Sub-category must be ${MAX_TAXONOMY_VALUE_LENGTH} characters or fewer.`,
  )
  .transform((value) => (value ? toProductSlug(value) : null));

const optionalSizeSchema = z
  .string()
  .trim()
  .max(
    MAX_TAXONOMY_VALUE_LENGTH,
    `Size must be ${MAX_TAXONOMY_VALUE_LENGTH} characters or fewer.`,
  )
  .transform((value) => (value ? toProductSlug(value) : null));

const imageSourceSchema = z
  .string()
  .trim()
  .min(1, "Image URL is required.")
  .max(
    MAX_PRODUCT_IMAGE_LENGTH,
    `Image URL must be ${MAX_PRODUCT_IMAGE_LENGTH} characters or fewer.`,
  )
  .refine(
    (value) => productImagePrefixes.some((prefix) => value.startsWith(prefix)),
    "Image URL must be a site-relative path or an http(s) URL.",
  );

const imageCollectionSchema = z
  .array(imageSourceSchema)
  .transform((images) => Array.from(new Set(images.map((image) => image.trim()).filter(Boolean))))
  .refine((images) => images.length > 0, "At least one product image is required.")
  .refine(
    (images) => images.length <= MAX_PRODUCT_IMAGE_COUNT,
    `You can upload up to ${MAX_PRODUCT_IMAGE_COUNT} product images.`,
  );

export const createProductSchema = z.object({
  name: requiredText("Name", MAX_PRODUCT_NAME_LENGTH),
  slug: slugSchema,
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a number.",
    })
    .int("Price must be a whole number.")
    .min(0, "Price cannot be negative.")
    .max(MAX_PRODUCT_PRICE, "Price exceeds the supported limit."),
  category: taxonomySchema("Category"),
  subCategory: optionalTaxonomySchema,
  material: taxonomySchema("Material"),
  type: taxonomySchema("Type"),
  size: optionalSizeSchema,
  images: imageCollectionSchema,
  description: z.string().trim().max(1000, "Description must be 1000 characters or fewer.").optional(),
});

export const updateProductSchema = createProductSchema.extend({
  id: objectIdSchema,
});

export const deleteProductSchema = z.object({
  id: objectIdSchema,
});

export const adminProductListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  query: optionalText(100).catch(null),
  category: optionalText(60).catch(null),
  material: optionalText(60).catch(null),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  stockStatus: z.enum(['in-stock', 'out-of-stock', 'low-stock']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type AdminProductListFilters = z.infer<typeof adminProductListFiltersSchema>;
