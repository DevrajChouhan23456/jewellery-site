import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentUsername = body.currentUsername?.trim() ?? "";
    const currentPassword = body.currentPassword ?? "";
    const newUsername = body.newUsername?.trim() || null;
    const newPassword = body.newPassword || null;

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    if (admin.username !== currentUsername) {
      return NextResponse.json(
        { error: "Current username does not match the signed-in admin." },
        { status: 400 }
      );
    }

    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const updateData: { username?: string; passwordHash?: string } = {};

    if (newUsername) {
      updateData.username = newUsername;
    }

    if (newPassword) {
      updateData.passwordHash = hashPassword(newPassword);
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: updateData,
    });

    return NextResponse.json({ message: "Admin credentials updated." });
  } catch (error) {
    console.error("ADMIN_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Unable to update admin credentials." },
      { status: 500 }
    );
  }
}
