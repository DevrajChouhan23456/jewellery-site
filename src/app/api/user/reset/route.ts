import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/server/auth/admin";

export async function POST() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const username = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin12345";

    await prisma.adminUser.upsert({
      where: { username },
      update: {
        passwordHash: hashPassword(password),
        role: "ADMIN",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorUpdatedAt: null,
      },
      create: {
        username,
        passwordHash: hashPassword(password),
        role: "ADMIN",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorUpdatedAt: null,
      },
    });

    return NextResponse.json({
      message: "Admin credentials reset to the seeded default values.",
    });
  } catch (error) {
    console.error("ADMIN_RESET_ERROR", error);
    return NextResponse.json(
      { error: "Unable to reset admin credentials." },
      { status: 500 }
    );
  }
}
