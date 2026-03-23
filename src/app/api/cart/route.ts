import { NextResponse } from "next/server";

import { addItem, getCartResponse, removeItem, updateQuantity } from "@/lib/cart";

export async function GET() {
  const cart = await getCartResponse();
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await addItem(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await updateQuantity(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await removeItem(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
