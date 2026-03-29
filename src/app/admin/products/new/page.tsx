import ProductForm from "@/features/admin/products/components/ProductForm";
import { requireAdminPageAccess } from "@/server/auth/admin";

export default async function NewProductPage() {
  await requireAdminPageAccess("/admin/products/new");

  return (
    <main className="luxury-shell py-10 sm:py-12">
      <ProductForm />
    </main>
  );
}
