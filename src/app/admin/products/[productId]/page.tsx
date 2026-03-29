import { notFound } from "next/navigation";

import ProductForm from "@/features/admin/products/components/ProductForm";
import { requireAdminPageAccess } from "@/server/auth/admin";
import { getAdminProductById } from "@/server/services/admin/products";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdminPageAccess("/admin/products");

  const { productId } = await params;
  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <ProductForm initialProduct={product} />
    </main>
  );
}
