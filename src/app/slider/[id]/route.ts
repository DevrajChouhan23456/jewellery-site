import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function DELETE(request: NextRequest, context: any) {
  const { id } = context.params as { id: string };

  try {
    await prisma.slider.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
