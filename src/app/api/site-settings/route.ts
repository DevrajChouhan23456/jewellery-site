import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/server/auth/admin";
import {
  getSiteIdentity,
  updateSiteIdentity,
} from "@/server/services/site-identity";

export async function GET() {
  const siteIdentity = await getSiteIdentity();

  return NextResponse.json({ siteIdentity }, { status: 200 });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = await updateSiteIdentity(body);

  if ("error" in result) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ siteIdentity: result.data }, { status: result.status });
}
