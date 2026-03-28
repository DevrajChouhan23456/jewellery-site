import { getCart, removeItem, updateQuantity } from "@/lib/cart";

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
  const result = await updateQuantity(await req.json().catch(() => null));

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
  const result = await removeItem(await req.json().catch(() => null));

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
