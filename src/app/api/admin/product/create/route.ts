import { NextResponse } from "next/server";

import { createProductSchema } from "@/features/admin/products/validation";
import {
  jsonBodyErrorResponse,
  parseJsonBody,
} from "@/server/api/validation";
import { requireAdminApiAccess } from "@/server/auth/admin";
import { createAdminProduct } from "@/server/services/admin/products";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const parsedBody = await parseJsonBody(req, createProductSchema);

  if (!parsedBody.success) {
    return jsonBodyErrorResponse(parsedBody, {
      includeFieldErrors: true,
      validationMessage: "Please review the highlighted product fields.",
    });
  }

  const result = await createAdminProduct(parsedBody.data);

  if ("error" in result) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}
