import { NextRequest, NextResponse } from "next/server";

import { createImageFileSchema, getZodErrorMessage } from "@/lib/api/validation";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdminApiAccess } from "@/server/auth/admin";
import {
  getSiteIdentity,
  updateSiteIdentity,
} from "@/server/services/site-identity";

const FALLBACK_LOGO_URL = "/images/logo.avif";
const logoUploadSchema = createImageFileSchema({
  requiredMessage: "No file uploaded",
});

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const data = await req.formData();
    const parsedFile = logoUploadSchema.safeParse(data.get("file"));

    if (!parsedFile.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsedFile.error, "No file uploaded") },
        { status: 400 },
      );
    }

    const file = parsedFile.data;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = await uploadImage(`data:${file.type};base64,${base64}`, {
      folder: "logos",
    });
    const currentSiteIdentity = await getSiteIdentity();
    const updateResult = await updateSiteIdentity({
      ...currentSiteIdentity,
      logoUrl: imageUrl,
    });

    if ("error" in updateResult) {
      return NextResponse.json(
        { error: updateResult.error },
        { status: updateResult.status },
      );
    }

    return NextResponse.json(
      { logoUrl: imageUrl, logo: { url: imageUrl } },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const siteIdentity = await getSiteIdentity();
    const logoUrl = siteIdentity.logoUrl || FALLBACK_LOGO_URL;

    return NextResponse.json(
      { logoUrl, logo: { url: logoUrl } },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Logo fetch error:", error);
    return NextResponse.json(
      { logoUrl: FALLBACK_LOGO_URL, logo: { url: FALLBACK_LOGO_URL } },
      { status: 200 },
    );
  }
}
