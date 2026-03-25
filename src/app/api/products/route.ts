import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducts } from "@/lib/storefront";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug")!;
  const page = Number(searchParams.get("page") || 1);
  const sort = searchParams.get("sort") as any;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const data = await getFilteredProducts({
    slug: searchParams.get("slug"),
    page: Number(searchParams.get("page") || 1),
    sort: searchParams.get("sort"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    materials: searchParams.get("materials")?.split(",").filter(Boolean) || [],
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
  });

  return NextResponse.json(
    { products: data.products, total: data.total },
  );
}
