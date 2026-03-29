import { NextResponse } from "next/server";

import { createImageFileSchema, getZodErrorMessage } from "@/lib/api/validation";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const storefrontImageSchema = createImageFileSchema({
  maxSize: MAX_FILE_SIZE,
  maxSizeMessage: "Images must be 5 MB or smaller.",
  allowEmptyType: false,
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const parsedFile = storefrontImageSchema.safeParse(formData.get("file"));

    if (!parsedFile.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsedFile.error, "Please choose an image file.") },
        { status: 400 },
      );
    }

    const file = parsedFile.data;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = await uploadImage(`data:${file.type};base64,${base64}`, {
      folder: "storefront",
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("STOREFRONT_IMAGE_UPLOAD_ERROR", error);

    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }
}
