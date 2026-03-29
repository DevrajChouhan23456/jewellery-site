import { NextResponse } from "next/server";

import { razorpayOrderRequestSchema } from "@/features/payments/razorpay/validation";
import {
  jsonBodyErrorResponse,
  parseJsonBody,
} from "@/server/api/validation";
import { getCurrentCustomerUserId } from "@/server/auth/customer-session";
import { createRazorpayPaymentOrder } from "@/server/services/payments/razorpay";

export async function POST(request: Request) {
  const parsedBody = await parseJsonBody(request, razorpayOrderRequestSchema);

  if (!parsedBody.success) {
    return jsonBodyErrorResponse(parsedBody, {
      validationMessage: "Invalid payment request.",
    });
  }

  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to continue to payment." },
      { status: 401 },
    );
  }

  const result = await createRazorpayPaymentOrder({
    orderId: parsedBody.data.orderId,
    userId,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}
