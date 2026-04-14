import { NextResponse } from "next/server";

import { getCurrentUserOrderByOrderNumber } from "@/lib/account";
import {
  serializeOrderForTracking,
  type OrderTrackingPayload,
} from "@/server/orders/tracking-serializer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;

  if (!orderNumber || orderNumber.length > 80) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const order = await getCurrentUserOrderByOrderNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload: OrderTrackingPayload = serializeOrderForTracking(order);

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
