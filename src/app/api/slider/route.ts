import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: "desc" },
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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${base64}`;

    const newImage = await prisma.slider.create({
      data: { imageUrl },
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
