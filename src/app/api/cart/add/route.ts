import { parseJsonBody } from "@/lib/api/validation";
import { addItem } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validations/cart";

export async function POST(req: Request) {
  const parsedBody = await parseJsonBody(req, addToCartSchema);

  if (!parsedBody.success) {
    return Response.json(
      {
        error:
          parsedBody.kind === "json"
            ? parsedBody.message
            : "Invalid add-to-cart payload.",
        ...(parsedBody.kind === "validation"
          ? { fieldErrors: parsedBody.error.flatten().fieldErrors }
          : {}),
      },
      { status: 400 },
    );
  }

  const result = await addItem(parsedBody.data);

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
