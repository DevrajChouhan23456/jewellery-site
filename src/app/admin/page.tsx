import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6">All Products</h1>

      <div className="space-y-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between border p-4 rounded"
          >
            <div>
              <h2>{p.name}</h2>
              <p className="text-sm text-gray-500">₹{p.price}</p>
            </div>

            <div className="flex gap-3">
              <Link href={`/admin/products/${p.id}`} className="text-blue-500">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}