import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6">Add Product</h1>
      <ProductForm />
    </div>
  );
}