import { NextResponse } from "next/server";

import { razorpayPaymentVerificationSchema } from "@/features/payments/razorpay/validation";
import {
  jsonBodyErrorResponse,
  parseJsonBody,
} from "@/server/api/validation";
import { getCurrentCustomerUserId } from "@/server/auth/customer-session";
import { verifyRazorpayPayment } from "@/server/services/payments/razorpay";

export async function POST(request: Request) {
  const parsedBody = await parseJsonBody(
    request,
    razorpayPaymentVerificationSchema,
  );

  if (!parsedBody.success) {
    return jsonBodyErrorResponse(parsedBody, {
      validationMessage: "Invalid payment confirmation.",
    });
  }

  const userId = await getCurrentCustomerUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to verify your payment." },
      { status: 401 },
    );
  }

  const result = await verifyRazorpayPayment({
    ...parsedBody.data,
    userId,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}
