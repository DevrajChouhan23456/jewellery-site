import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import {
  adminProductListFiltersSchema,
  createProductSchema,
  deleteProductSchema,
  type CreateProductInput,
  type DeleteProductInput,
  updateProductSchema,
} from "@/features/admin/products/validation";

const ADMIN_PRODUCTS_PAGE_SIZE = 20;

const adminProductListSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  category: true,
  subCategory: true,
  material: true,
  type: true,
  size: true,
  stock: true,
  images: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

const adminProductDetailSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  category: true,
  subCategory: true,
  material: true,
  type: true,
  size: true,
  images: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

type FieldErrors = Record<string, string[] | undefined>;

type ProductMutationResult<T> =
  | {
      data: T;
      status: number;
    }
  | {
      error: string;
      fieldErrors?: FieldErrors;
      status: number;
    };

export type AdminProductListItem = Prisma.ProductGetPayload<{
  select: typeof adminProductListSelect;
}>;

export type AdminProductDetail = Prisma.ProductGetPayload<{
  select: typeof adminProductDetailSelect;
}>;

function validationError(
  message: string,
  fieldErrors?: FieldErrors,
): ProductMutationResult<never> {
  return {
    error: message,
    ...(fieldErrors ? { fieldErrors } : {}),
    status: 400,
  };
}

function failure(
  message: string,
  status: number,
  fieldErrors?: FieldErrors,
): ProductMutationResult<never> {
  return {
    error: message,
    ...(fieldErrors ? { fieldErrors } : {}),
    status,
  };
}

function revalidateProductPaths(product: {
  category: string;
  id: string;
}) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath(`/admin/products/${product.id}`);
  revalidatePath(`/shop/${product.category}`);
}

async function isSlugAvailable(slug: string, excludedProductId?: string) {
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return true;
  }

  return existing.id === excludedProductId;
}

export async function getAdminProductList(input: unknown) {
  const parsed = adminProductListFiltersSchema.safeParse(input);
  const filters = parsed.success ? parsed.data : { page: 1, query: null, category: null, material: null, minPrice: undefined, maxPrice: undefined, stockStatus: undefined };
  const page = filters.page;
  const query = filters.query?.trim() || null;
  const skip = (page - 1) * ADMIN_PRODUCTS_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { slug: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } },
      { material: { contains: query, mode: 'insensitive' } },
      { type: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.material) {
    where.material = filters.material;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.stockStatus) {
    switch (filters.stockStatus) {
      case 'out-of-stock':
        where.stock = 0;
        break;
      case 'low-stock':
        where.stock = { gt: 0, lte: 10 };
        break;
      case 'in-stock':
        where.stock = { gt: 10 };
        break;
    }
  }

  const [totalProducts, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: ADMIN_PRODUCTS_PAGE_SIZE,
      select: adminProductListSelect,
    }),
  ]);

  return {
    items: products,
    page,
    pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    query: query ?? "",
    totalItems: totalProducts,
    totalPages: Math.max(1, Math.ceil(totalProducts / ADMIN_PRODUCTS_PAGE_SIZE)),
    filters,
  };
}

export async function getAdminProductById(productId: string) {
  const parsed = updateProductSchema.shape.id.safeParse(productId);

  if (!parsed.success) {
    return null;
  }

  return prisma.product.findUnique({
    where: { id: parsed.data },
    select: adminProductDetailSelect,
  });
}

export async function getAdminProductDashboardData() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalProducts, addedThisMonth, recentProducts] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
    prisma.product.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
      select: adminProductListSelect,
    }),
  ]);

  return {
    totalProducts,
    addedThisMonth,
    recentProducts,
    lastCreatedAt: recentProducts[0]?.createdAt ?? null,
  };
}

export async function createAdminProduct(
  body: unknown,
): Promise<ProductMutationResult<{ product: AdminProductDetail }>> {
  try {
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(
        "Please review the highlighted product fields.",
        parsed.error.flatten().fieldErrors,
      );
    }

    if (!(await isSlugAvailable(parsed.data.slug))) {
      return failure("A product with this slug already exists.", 409, {
        slug: ["Slug is already in use."],
      });
    }

    const product = await prisma.product.create({
      data: parsed.data,
      select: adminProductDetailSelect,
    });

    revalidateProductPaths(product);

    return {
      data: { product },
      status: 201,
    };
  } catch (error) {
    console.error("Failed to create admin product:", error);
    return failure("Unable to create the product right now.", 500);
  }
}

export async function updateAdminProduct(
  body: unknown,
): Promise<ProductMutationResult<{ product: AdminProductDetail }>> {
  try {
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(
        "Please review the highlighted product fields.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        category: true,
      },
    });

    if (!existingProduct) {
      return failure("Product not found.", 404);
    }

    if (!(await isSlugAvailable(parsed.data.slug, parsed.data.id))) {
      return failure("A product with this slug already exists.", 409, {
        slug: ["Slug is already in use."],
      });
    }

    const product = await prisma.product.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        price: parsed.data.price,
        category: parsed.data.category,
        subCategory: parsed.data.subCategory,
        material: parsed.data.material,
        type: parsed.data.type,
        size: parsed.data.size,
        images: parsed.data.images,
        description: parsed.data.description,
      },
      select: adminProductDetailSelect,
    });

    revalidateProductPaths(product);

    if (existingProduct.category !== product.category) {
      revalidatePath(`/shop/${existingProduct.category}`);
    }

    return {
      data: { product },
      status: 200,
    };
  } catch (error) {
    console.error("Failed to update admin product:", error);
    return failure("Unable to update the product right now.", 500);
  }
}

export async function deleteAdminProduct(
  body: unknown,
): Promise<ProductMutationResult<{ deleted: true; productId: string }>> {
  try {
    const parsed = deleteProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(
        "Invalid product delete request.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        category: true,
      },
    });

    if (!product) {
      return failure("Product not found.", 404);
    }

    await prisma.product.delete({
      where: { id: parsed.data.id },
    });

    revalidateProductPaths(product);

    return {
      data: { deleted: true, productId: parsed.data.id },
      status: 200,
    };
  } catch (error) {
    console.error("Failed to delete admin product:", error);
    return failure("Unable to delete the product right now.", 500);
  }
}

export async function createAdminProductsBulk(
  products: CreateProductInput[],
): Promise<ProductMutationResult<{ products: AdminProductDetail[]; created: number; skipped: number }>> {
  try {
    if (products.length === 0) {
      return validationError("No products to create.");
    }

    if (products.length > 100) {
      return validationError("Cannot create more than 100 products at once.");
    }

    // Check for duplicate slugs within the batch
    const slugs = products.map(p => p.slug);
    const uniqueSlugs = new Set(slugs);
    if (slugs.length !== uniqueSlugs.size) {
      return validationError("Duplicate slugs found in the batch.");
    }

    // Check for existing slugs in database
    const existingSlugs = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const existingSlugSet = new Set(existingSlugs.map(p => p.slug));

    const validProducts = products.filter(p => !existingSlugSet.has(p.slug));
    const skipped = products.length - validProducts.length;

    if (validProducts.length === 0) {
      return validationError("All products have duplicate slugs.");
    }

    await prisma.product.createMany({
      data: validProducts,
    });

    const createdProducts = await prisma.product.findMany({
      where: { slug: { in: validProducts.map(p => p.slug) } },
      select: adminProductDetailSelect,
    });

    // Revalidate paths for created products
    createdProducts.forEach(product => revalidateProductPaths(product));

    return {
      data: {
        products: createdProducts,
        created: createdProducts.length,
        skipped,
      },
      status: 201,
    };
  } catch (error) {
    console.error("Failed to bulk create admin products:", error);
    return failure("Unable to create products right now.", 500);
  }
}
