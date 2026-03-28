import { addItem } from "@/lib/cart";

export async function POST(req: Request) {
  const result = await addItem(await req.json().catch(() => null));

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
