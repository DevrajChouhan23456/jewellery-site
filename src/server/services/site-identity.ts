import { revalidatePath, unstable_noStore as noStore } from "next/cache";

import prisma from "@/lib/prisma";
import {
  DEFAULT_SITE_IDENTITY,
  normalizeSiteIdentity,
  SITE_IDENTITY_SETTING_KEY,
  siteIdentityInputSchema,
  type SiteIdentity,
} from "@/lib/site-identity";

type SiteIdentityMutationResult =
  | {
      data: SiteIdentity;
      status: number;
    }
  | {
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
      status: number;
    };

export async function getSiteIdentity() {
  noStore();

  try {
    const setting = await prisma.automationSettings.findUnique({
      where: { key: SITE_IDENTITY_SETTING_KEY },
      select: { value: true },
    });

    return normalizeSiteIdentity(setting?.value);
  } catch (error) {
    console.error("SITE_IDENTITY_READ_ERROR", error);
    return { ...DEFAULT_SITE_IDENTITY };
  }
}

function revalidateSiteIdentityPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/logo");
}

export async function updateSiteIdentity(
  input: unknown,
): Promise<SiteIdentityMutationResult> {
  const parsed = siteIdentityInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Please review the branding details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      status: 400,
    };
  }

  try {
    await prisma.automationSettings.upsert({
      where: { key: SITE_IDENTITY_SETTING_KEY },
      update: {
        value: parsed.data,
        description: "Storefront branding and logo settings.",
        isEnabled: true,
        updatedAt: new Date(),
      },
      create: {
        key: SITE_IDENTITY_SETTING_KEY,
        value: parsed.data,
        description: "Storefront branding and logo settings.",
        isEnabled: true,
      },
    });

    revalidateSiteIdentityPaths();

    return {
      data: parsed.data,
      status: 200,
    };
  } catch (error) {
    console.error("SITE_IDENTITY_UPDATE_ERROR", error);

    return {
      error: "Unable to update the site identity right now.",
      status: 500,
    };
  }
}
