import { NextResponse } from "next/server";

import { createImageFileSchema, getZodErrorMessage } from "@/lib/api/validation";
import { uploadImage } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

const sliderUploadSchema = createImageFileSchema({
  requiredMessage: "No file provided.",
});

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error("SLIDER_FETCH_ERROR", error);
    return NextResponse.json(
      { error: "Failed to load slider images." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const parsedFile = sliderUploadSchema.safeParse(formData.get("file"));

    if (!parsedFile.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsedFile.error, "No file provided.") },
        { status: 400 },
      );
    }

    const file = parsedFile.data;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const imageUrl = await uploadImage(`data:${mimeType};base64,${base64}`, {
      folder: "slider",
    });

    const newImage = await prisma.slider.create({
      data: { imageUrl },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("SLIDER_UPLOAD_ERROR", error);
    return NextResponse.json(
      { error: "Failed to upload slider image." },
      { status: 500 }
    );
  }
}
