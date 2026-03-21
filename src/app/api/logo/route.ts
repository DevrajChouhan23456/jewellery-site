import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const FALLBACK_LOGO_URL = "/images/logo.avif";
const SITE_LOGO_ID = "site-logo";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    configureCloudinary();

    const data = await req.formData();
    const file = data.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "logos",
    });

    await prisma.logo.upsert({
      where: { id: SITE_LOGO_ID },
      update: { imageUrl: result.secure_url },
      create: { id: SITE_LOGO_ID, imageUrl: result.secure_url },
    });

    return NextResponse.json(
      { logoUrl: result.secure_url, logo: { url: result.secure_url } },
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
    const primary = await prisma.logo.findUnique({ where: { id: SITE_LOGO_ID } });
    const fallback =
      primary ??
      (await prisma.logo.findFirst({
        orderBy: { createdAt: "desc" },
      }));
    const logoUrl = fallback?.imageUrl ?? FALLBACK_LOGO_URL;

    return NextResponse.json({ logoUrl, logo: { url: logoUrl } }, { status: 200 });
  } catch (error: unknown) {
    console.error("Logo fetch error:", error);
    return NextResponse.json(
      { logoUrl: FALLBACK_LOGO_URL, logo: { url: FALLBACK_LOGO_URL } },
      { status: 200 },
    );
  }
}
