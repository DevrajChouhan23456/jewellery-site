import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { studioPath } from "@/sanity/env";

const retirementPayload = {
  error:
    "The legacy Prisma storefront editor has been retired. Edit storefront content in Sanity Studio instead.",
  retired: true,
  studioPath,
} as const;

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function retiredResponse() {
  return NextResponse.json(retirementPayload, { status: 410 });
}

async function requireAdmin() {
  const session = await auth();
  return Boolean(session && session.user.role === "ADMIN");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return unauthorizedResponse();
  }

  return retiredResponse();
}

export async function PUT() {
  if (!(await requireAdmin())) {
    return unauthorizedResponse();
  }

  return retiredResponse();
}
