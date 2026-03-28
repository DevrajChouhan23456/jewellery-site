import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/isAdmin";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) redirect("/");

  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Panel</h1>

      <div className="flex gap-4">
        <Link href="/admin/products" className="border px-4 py-2 rounded">
          Manage Products
        </Link>

        <Link href="/admin/products/new" className="border px-4 py-2 rounded">
          Add Product
        </Link>
      </div>
    </div>
  );
}
