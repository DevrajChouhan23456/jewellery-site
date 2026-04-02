import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/features/admin/products/validation";

export type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  subCategory: string | null;
  material: string;
  type: string;
  size: string | null;
  images: string[];
};

export type ProductFieldErrors = Record<string, string[] | undefined>;

type ProductMutationErrorResponse = {
  error?: string;
  fieldErrors?: ProductFieldErrors;
};

export type ProductMutationSuccessResponse = {
  product: ProductFormInitialData;
};

export type ProductDeleteSuccessResponse = {
  deleted: true;
  productId: string;
};

export type ProductApiError = Error & {
  fieldErrors?: ProductFieldErrors;
};

async function parseJsonResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as
    | (ProductMutationErrorResponse & Partial<T>)
    | null;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse<T>(response);

  if (!response.ok) {
    const error = new Error(result?.error || "Request failed.") as ProductApiError;

    if (result?.fieldErrors) {
      error.fieldErrors = result.fieldErrors;
    }

    throw error;
  }

  if (!result) {
    throw new Error("The server returned an empty response.");
  }

  return result as T;
}

export async function createAdminProductRequest(payload: CreateProductInput) {
  return postJson<ProductMutationSuccessResponse>(
    "/api/admin/product/create",
    payload,
  );
}

export async function updateAdminProductRequest(payload: UpdateProductInput) {
  return postJson<ProductMutationSuccessResponse>(
    "/api/admin/product/update",
    payload,
  );
}

export async function deleteAdminProductRequest(productId: string) {
  return postJson<ProductDeleteSuccessResponse>("/api/admin/product/delete", {
    id: productId,
  });
}

export async function createAdminProductsBulkRequest(products: CreateProductInput[]) {
  return postJson<{ products: ProductFormInitialData[]; created: number; skipped: number }>(
    "/api/admin/product/bulk-create",
    products,
  );
}
