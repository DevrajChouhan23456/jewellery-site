import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildTotpSetupUri,
  decryptTotpSecret,
  encryptTotpSecret,
  formatTotpSecret,
  generateTotpSecret,
  getTotpIssuer,
  verifyTotpCode,
} from "@/lib/admin-two-factor";
import { getZodErrorMessage, parseJsonBody } from "@/lib/api/validation";
import { verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/server/auth/admin";

const confirmTwoFactorSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit code."),
});

const disableTwoFactorSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit code."),
  currentPassword: z.string().min(1, "Current password is required."),
});

async function getAuthenticatedAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorPendingSecret: true,
      twoFactorUpdatedAt: true,
    },
  });

  return admin;
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    enabled: Boolean(admin.twoFactorEnabled && admin.twoFactorSecret),
    hasPendingSetup: Boolean(admin.twoFactorPendingSecret),
    issuer: getTotpIssuer(),
    updatedAt: admin.twoFactorUpdatedAt?.toISOString() ?? null,
    username: admin.username,
  });
}

export async function POST() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const secret = generateTotpSecret();
    const encryptedPendingSecret = encryptTotpSecret(secret);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        twoFactorPendingSecret: encryptedPendingSecret,
      },
    });

    return NextResponse.json({
      enabled: Boolean(admin.twoFactorEnabled && admin.twoFactorSecret),
      formattedSecret: formatTotpSecret(secret),
      otpauthUrl: buildTotpSetupUri(admin.username, secret),
      secret,
      username: admin.username,
    });
  } catch (error) {
    console.error("ADMIN_2FA_SETUP_ERROR", error);
    return NextResponse.json(
      { error: "Unable to start admin 2FA setup." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(request, confirmTwoFactorSchema);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Invalid 2FA confirmation request."),
      },
      { status: 400 },
    );
  }

  if (!admin.twoFactorPendingSecret) {
    return NextResponse.json(
      { error: "Start 2FA setup before confirming it." },
      { status: 400 },
    );
  }

  try {
    const secret = decryptTotpSecret(admin.twoFactorPendingSecret);

    if (!verifyTotpCode(secret, parsedBody.data.code)) {
      return NextResponse.json(
        { error: "The authenticator code is invalid or expired." },
        { status: 400 },
      );
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: admin.twoFactorPendingSecret,
        twoFactorPendingSecret: null,
        twoFactorUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Admin two-factor authentication is now enabled.",
    });
  } catch (error) {
    console.error("ADMIN_2FA_CONFIRM_ERROR", error);
    return NextResponse.json(
      { error: "Unable to confirm admin 2FA." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(request, disableTwoFactorSchema);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : getZodErrorMessage(parsedBody.error, "Invalid 2FA disable request."),
      },
      { status: 400 },
    );
  }

  if (!admin.twoFactorSecret || !admin.twoFactorEnabled) {
    return NextResponse.json(
      { error: "Admin two-factor authentication is not enabled." },
      { status: 400 },
    );
  }

  if (!verifyPassword(parsedBody.data.currentPassword, admin.passwordHash)) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  try {
    const secret = decryptTotpSecret(admin.twoFactorSecret);

    if (!verifyTotpCode(secret, parsedBody.data.code)) {
      return NextResponse.json(
        { error: "The authenticator code is invalid or expired." },
        { status: 400 },
      );
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Admin two-factor authentication has been disabled.",
    });
  } catch (error) {
    console.error("ADMIN_2FA_DISABLE_ERROR", error);
    return NextResponse.json(
      { error: "Unable to disable admin 2FA." },
      { status: 500 },
    );
  }
}
