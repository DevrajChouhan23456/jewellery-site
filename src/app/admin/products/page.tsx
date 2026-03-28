import Link from "next/link";

import prisma from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-10">
      <h1 className="mb-6 text-2xl">All Products</h1>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex justify-between rounded border p-4"
          >
            <div>
              <h2>{product.name}</h2>
              <p className="text-sm text-gray-500">INR {product.price}</p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/admin/products/${product.id}`}
                className="text-blue-500"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
