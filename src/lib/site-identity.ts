import { z } from "zod";

const MAX_SITE_NAME_LENGTH = 80;
const MAX_SHORT_NAME_LENGTH = 24;
const MAX_TAGLINE_LENGTH = 60;
const MAX_IMAGE_URL_LENGTH = 2_048;
const supportedImagePrefixes = ["http://", "https://", "/"] as const;

export const SITE_IDENTITY_SETTING_KEY = "site_identity";

export const DEFAULT_SITE_IDENTITY = {
  siteName: "Auraa Fashion Jewellery",
  shortName: "AURAA",
  tagline: "Fashion Jewellery",
  logoUrl: "/images/logo.avif",
} as const;

function isSupportedImageSource(value: string) {
  return supportedImagePrefixes.some((prefix) => value.startsWith(prefix));
}

function requiredText(label: string, maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`);
}

const optionalDisplayText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`)
    .optional();

const optionalImageSource = z
  .string()
  .trim()
  .max(
    MAX_IMAGE_URL_LENGTH,
    `Logo URL must be ${MAX_IMAGE_URL_LENGTH} characters or fewer.`,
  )
  .refine(
    (value) => value.length === 0 || isSupportedImageSource(value),
    "Logo URL must be a site-relative path or an http(s) URL.",
  )
  .optional();

export const siteIdentityInputSchema = z
  .object({
    siteName: requiredText("Site name", MAX_SITE_NAME_LENGTH),
    shortName: requiredText("Short name", MAX_SHORT_NAME_LENGTH),
    tagline: optionalDisplayText("Tagline", MAX_TAGLINE_LENGTH),
    logoUrl: optionalImageSource,
  })
  .transform((value) => ({
    siteName: value.siteName,
    shortName: value.shortName,
    tagline: value.tagline?.trim() || DEFAULT_SITE_IDENTITY.tagline,
    logoUrl: value.logoUrl?.trim() || DEFAULT_SITE_IDENTITY.logoUrl,
  }));

const siteIdentityStoredSchema = z.object({
  siteName: requiredText("Site name", MAX_SITE_NAME_LENGTH).optional(),
  shortName: requiredText("Short name", MAX_SHORT_NAME_LENGTH).optional(),
  tagline: optionalDisplayText("Tagline", MAX_TAGLINE_LENGTH),
  logoUrl: optionalImageSource,
});

export type SiteIdentity = z.output<typeof siteIdentityInputSchema>;
export type SiteIdentityInput = z.input<typeof siteIdentityInputSchema>;

export function normalizeSiteIdentity(value: unknown): SiteIdentity {
  const parsed = siteIdentityStoredSchema.safeParse(value);

  if (!parsed.success) {
    return { ...DEFAULT_SITE_IDENTITY };
  }

  return {
    siteName: parsed.data.siteName?.trim() || DEFAULT_SITE_IDENTITY.siteName,
    shortName: parsed.data.shortName?.trim() || DEFAULT_SITE_IDENTITY.shortName,
    tagline: parsed.data.tagline?.trim() || DEFAULT_SITE_IDENTITY.tagline,
    logoUrl: parsed.data.logoUrl?.trim() || DEFAULT_SITE_IDENTITY.logoUrl,
  };
}

export function hasCustomSiteLogo(siteIdentity: Pick<SiteIdentity, "logoUrl">) {
  return (
    Boolean(siteIdentity.logoUrl) &&
    siteIdentity.logoUrl !== DEFAULT_SITE_IDENTITY.logoUrl
  );
}
