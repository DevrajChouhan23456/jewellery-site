import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.slider.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Slider image deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("SLIDER_DELETE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete slider image." },
      { status: 500 }
    );
  }
}
