import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducts } from "@/lib/storefront";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug") ?? undefined;
  const page = Number(searchParams.get("page") || 1);
  const sort = searchParams.get("sort") ?? undefined;
  const minPrice = searchParams.get("minPrice") ?? undefined;
  const maxPrice = searchParams.get("maxPrice") ?? undefined;

  const data = await getFilteredProducts({
    slug,
    page,
    sort,
    minPrice,
    maxPrice,
    materials: searchParams.get("materials")?.split(",").filter(Boolean) || [],
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
  });

  return NextResponse.json(
    { products: data.products, total: data.total },
  );
}
