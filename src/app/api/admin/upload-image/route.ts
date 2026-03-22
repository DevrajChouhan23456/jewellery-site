import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return unauthorizedResponse();
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const imageUrl = `data:${file.type};base64,${base64}`;

  return NextResponse.json({ imageUrl });
}
