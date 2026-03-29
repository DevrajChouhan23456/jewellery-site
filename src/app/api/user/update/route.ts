import { NextResponse } from "next/server";
import { z } from "zod";

import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";

const optionalUsernameSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalized = value.trim();
    return normalized ? normalized : undefined;
  },
  z.string().min(1).optional(),
);

const optionalPasswordSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const updateAdminCredentialsSchema = z.object({
  currentUsername: z.string().trim().min(1, "Current username is required."),
  currentPassword: z.string().min(1, "Current password is required."),
  newUsername: optionalUsernameSchema,
  newPassword: optionalPasswordSchema,
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsedBody = await parseJsonBody(req, updateAdminCredentialsSchema);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error:
            parsedBody.kind === "json"
              ? parsedBody.message
              : getZodErrorMessage(parsedBody.error, "Invalid credentials update request."),
        },
        { status: 400 },
      );
    }

    const { currentUsername, currentPassword, newUsername, newPassword } = parsedBody.data;

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
