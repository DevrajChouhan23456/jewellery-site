import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
// import prisma from "@/lib/primsa";

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: "desc" },
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "slider" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    // Save in DB
    const newImage = await prisma.slider.create({
      data: { imageUrl: uploadRes.secure_url },
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
