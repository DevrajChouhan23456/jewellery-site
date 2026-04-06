import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { buildAdminAccessPath } from "@/lib/admin-gate";
import { auth } from "@/lib/auth";

type AdminSession = NonNullable<Awaited<ReturnType<typeof auth>>>;

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function requireAdminPageAccess(callbackUrl: string) {
  const session = await auth();

  if (!session) {
    redirect(buildAdminAccessPath(callbackUrl));
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAdminApiAccess() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
