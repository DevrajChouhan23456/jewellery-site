import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/server/auth/admin";
import { getDynamicPricingSuggestions } from "@/server/services/admin/orders";

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await req.json();
    const { productId, category, material } = body;

    if (!category || !material) {
      return NextResponse.json(
        { error: "Missing required fields: category, material" },
        { status: 400 }
      );
    }

    const suggestion = await getDynamicPricingSuggestions(productId, category, material);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Error getting pricing suggestion:", error);
    return NextResponse.json(
      { error: "Failed to get pricing suggestion" },
      { status: 500 }
    );
  }
}