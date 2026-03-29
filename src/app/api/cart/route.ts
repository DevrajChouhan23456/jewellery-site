import { parseJsonBody } from "@/lib/api/validation";
import { getCart, removeItem, updateQuantity } from "@/lib/cart";
import { removeCartItemSchema, updateCartQuantitySchema } from "@/lib/validations/cart";

export async function GET() {
  const result = await getCart();

  if ("error" in result) {
    return Response.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return Response.json(result.data, { status: result.status });
}

export async function PATCH(req: Request) {
  const parsedBody = await parseJsonBody(req, updateCartQuantitySchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : "Invalid cart update payload.",
        ...(parsedBody.kind === "validation"
          ? { fieldErrors: parsedBody.error.flatten().fieldErrors }
          : {}),
      },
      { status: 400 },
    );
  }

  const result = await updateQuantity(parsedBody.data);

  if ("error" in result) {
    return Response.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return Response.json(result.data, { status: result.status });
}

export async function DELETE(req: Request) {
  const parsedBody = await parseJsonBody(req, removeCartItemSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : "Invalid cart removal payload.",
        ...(parsedBody.kind === "validation"
          ? { fieldErrors: parsedBody.error.flatten().fieldErrors }
          : {}),
      },
      { status: 400 },
    );
  }

  const result = await removeItem(parsedBody.data);

  if ("error" in result) {
    return Response.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return Response.json(result.data, { status: result.status });
}
