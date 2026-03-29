import { NextResponse } from "next/server";

import { deleteProductSchema } from "@/features/admin/products/validation";
import {
  jsonBodyErrorResponse,
  parseJsonBody,
} from "@/server/api/validation";
import { requireAdminApiAccess } from "@/server/auth/admin";
import { deleteAdminProduct } from "@/server/services/admin/products";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const parsedBody = await parseJsonBody(req, deleteProductSchema);

  if (!parsedBody.success) {
    return jsonBodyErrorResponse(parsedBody, {
      includeFieldErrors: true,
      validationMessage: "Invalid product delete request.",
    });
  }

  const result = await deleteAdminProduct(parsedBody.data);

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
