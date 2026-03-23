import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

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
  } catch (err) {
    console.error("SLIDER FETCH ERROR:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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

    return NextResponse.json(newImage);
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Slider ID is required" },
        { status: 400 }
      );
    }

    // Delete from DB
    await prisma.slider.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Slider image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting slider image:", error);
    return NextResponse.json(
      { error: "Failed to delete slider image" },
      { status: 500 }
    );
  }
}
