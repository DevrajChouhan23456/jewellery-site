import { NextResponse } from "next/server";

import { checkoutSchema } from "@/features/checkout/validation";
import {
  jsonBodyErrorResponse,
  parseJsonBody,
} from "@/server/api/validation";
import { checkout } from "@/server/services/checkout";

export async function POST(request: Request) {
  const parsedBody = await parseJsonBody(request, checkoutSchema);

  if (!parsedBody.success) {
    return jsonBodyErrorResponse(parsedBody, {
      includeFieldErrors: true,
      validationMessage: "Invalid checkout details.",
    });
  }

  const result = await checkout(parsedBody.data);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ order: result.data }, { status: result.status });
}
