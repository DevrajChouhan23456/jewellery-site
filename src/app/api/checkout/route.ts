import { NextResponse } from "next/server";

import { checkout } from "@/lib/checkout";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await checkout(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
