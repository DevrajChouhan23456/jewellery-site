"use client";

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminProductRequest,
  deleteAdminProductRequest,
  getProductApiFieldErrors,
  type ProductFormInitialData,
  updateAdminProductRequest,
} from "@/features/admin/products/api";
import {
  createProductSchema,
  toProductSlug,
  updateProductSchema,
} from "@/features/admin/products/validation";

import { FormCard, FormField, FormGroup } from "./FormComponents";
import { ImageGallery } from "./ImageGallery";

type ProductFormValues = {
  category: string;
  images: string[];
  material: string;
  name: string;
  price: string;
  slug: string;
  subCategory: string;
  type: string;
};

const emptyProductFormValues: ProductFormValues = {
  category: "jewellery",
  images: [""],
  material: "gold",
  name: "",
  price: "",
  slug: "",
  subCategory: "",
  type: "ring",
};

function toFormValues(product?: ProductFormInitialData): ProductFormValues {
  if (!product) {
    return emptyProductFormValues;
  }

  return {
    category: product.category,
    images: product.images.length > 0 ? product.images : [""],
    material: product.material,
    name: product.name,
    price: String(product.price),
    slug: product.slug,
    subCategory: product.subCategory ?? "",
    type: product.type,
  };
}

function getFirstFieldErrors(fieldErrors?: Record<string, string[] | undefined>) {
  if (!fieldErrors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."]),
  );
}

export default function ProductForm({
  initialProduct,
}: {
  initialProduct?: ProductFormInitialData;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(() => toFormValues(initialProduct));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const [slugEdited, setSlugEdited] = useState(Boolean(initialProduct?.slug));

  const isEditMode = Boolean(initialProduct?.id);

  function setValue<K extends keyof ProductFormValues>(key: K, nextValue: ProductFormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
    setFieldErrors((current) => {
      if (!(key in current)) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function updateImageAt(index: number, nextValue: string) {
    setValues((current) => {
      const nextImages = [...current.images];
      nextImages[index] = nextValue;

      return {
        ...current,
        images: nextImages,
      };
    });
    setFieldErrors((current) => {
      if (!current.images) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.images;
      return nextErrors;
    });
  }

  function addImageField() {
    setValues((current) => ({
      ...current,
      images: [...current.images, ""],
    }));
  }

  function removeImageAt(index: number) {
    setValues((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);

      return {
        ...current,
        images: nextImages.length > 0 ? nextImages : [""],
      };
    });
  }

  function handleNameChange(nextName: string) {
    setValue("name", nextName);

    if (!slugEdited) {
      setValue("slug", toProductSlug(nextName));
    }
  }

  async function handleDelete() {
    if (!initialProduct?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${initialProduct.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setSubmitError(null);

    try {
      await deleteAdminProductRequest(initialProduct.id);

      toast.success("Product deleted.");
      startNavigation(() => {
        router.push("/admin/products");
        router.refresh();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitError(null);

    const payload = {
      name: values.name,
      slug: values.slug,
      price: values.price,
      category: values.category,
      subCategory: values.subCategory,
      material: values.material,
      type: values.type,
      images: values.images,
      ...(initialProduct?.id ? { id: initialProduct.id } : {}),
    };

    if (initialProduct?.id) {
      const parsed = updateProductSchema.safeParse(payload);

      if (!parsed.success) {
        const nextFieldErrors = getFirstFieldErrors(
          parsed.error.flatten().fieldErrors,
        );
        setFieldErrors(nextFieldErrors);
        setSubmitError("Please fix the highlighted fields before saving.");
        toast.error("Please fix the highlighted fields.");
        return;
      }

      setIsSubmitting(true);

      try {
        await updateAdminProductRequest(parsed.data);
        toast.success("Product updated.");
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        const nextFieldErrors = getFirstFieldErrors(getProductApiFieldErrors(error));

        if (Object.keys(nextFieldErrors).length > 0) {
          setFieldErrors(nextFieldErrors);
        }

        const message = error instanceof Error ? error.message : "Save failed.";
        setSubmitError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const parsed = createProductSchema.safeParse(payload);

    if (!parsed.success) {
      const nextFieldErrors = getFirstFieldErrors(parsed.error.flatten().fieldErrors);
      setFieldErrors(nextFieldErrors);
      setSubmitError("Please fix the highlighted fields before saving.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAdminProductRequest(parsed.data);

      toast.success("Product created.");
      startNavigation(() => {
        router.push(`/admin/products/${result.product.id}`);
        router.refresh();
      });
    } catch (error) {
      const nextFieldErrors = getFirstFieldErrors(getProductApiFieldErrors(error));

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
      }

      const message = error instanceof Error ? error.message : "Save failed.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormCard
        title={isEditMode ? "Edit product" : "Create product"}
        description={
          isEditMode
            ? "Update the product safely with shared validation, normalized catalog metadata, and guarded admin mutations."
            : "Create a production-ready catalog record with normalized slugs, taxonomy values, and validated media."
        }
        action={
          isEditMode ? (
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting || isNavigating}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Deleting
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete
                </>
              )}
            </Button>
          ) : null
        }
      >
        <FormGroup columns={2}>
          <FormField
            label="Product name"
            description="Customer-facing title used across the catalog."
            error={fieldErrors.name}
          >
            <Input
              value={values.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Classic diamond ring"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>

          <FormField
            label="Slug"
            description="Stable internal identifier used for uniqueness and admin operations."
            error={fieldErrors.slug}
          >
            <Input
              value={values.slug}
              onChange={(event) => {
                setSlugEdited(true);
                setValue("slug", event.target.value);
              }}
              placeholder="classic-diamond-ring"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>
        </FormGroup>

        <FormGroup columns={2}>
          <FormField
            label="Price (INR)"
            description="Whole-number selling price in Indian rupees."
            error={fieldErrors.price}
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={values.price}
              onChange={(event) => setValue("price", event.target.value)}
              placeholder="24999"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>

          <FormField
            label="Category"
            description="Primary storefront grouping and shop-page slug."
            error={fieldErrors.category}
          >
            <Input
              value={values.category}
              onChange={(event) => setValue("category", event.target.value)}
              placeholder="jewellery"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>
        </FormGroup>

        <FormGroup columns={2}>
          <FormField
            label="Sub-category"
            description="Optional deeper grouping for filtered catalog views."
            error={fieldErrors.subCategory}
          >
            <Input
              value={values.subCategory}
              onChange={(event) => setValue("subCategory", event.target.value)}
              placeholder="engagement-rings"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>

          <FormField
            label="Material"
            description="Normalized material label used in filters."
            error={fieldErrors.material}
          >
            <Input
              value={values.material}
              onChange={(event) => setValue("material", event.target.value)}
              placeholder="gold"
              className="h-11 rounded-xl border-stone-200 bg-white px-4"
            />
          </FormField>
        </FormGroup>

        <FormField
          label="Type"
          description="Specific product type used in search and taxonomy."
          error={fieldErrors.type}
        >
          <Input
            value={values.type}
            onChange={(event) => setValue("type", event.target.value)}
            placeholder="ring"
            className="h-11 rounded-xl border-stone-200 bg-white px-4"
          />
        </FormField>
      </FormCard>

      <FormCard
        title="Media"
        description="Use a strong primary image and keep the supporting gallery clean and deduplicated."
      >
        <FormField
          label="Primary image"
          description="The first image becomes the default storefront preview."
          error={fieldErrors.images}
        >
          <ImageGallery
            label="Primary product image"
            selectedImage={values.images[0] ?? ""}
            onImageSelect={(url) => updateImageAt(0, url)}
          />
        </FormField>

        <FormField
          label="Additional gallery images"
          description="Optional supporting images for alternate angles, close-ups, and merchandising."
        >
          <div className="space-y-3">
            {values.images.slice(1).map((image, index) => {
              const imageIndex = index + 1;

              return (
                <div key={`product-image-${imageIndex}`} className="flex gap-3">
                  <Input
                    value={image}
                    onChange={(event) => updateImageAt(imageIndex, event.target.value)}
                    placeholder="https://..."
                    className="h-11 rounded-xl border-stone-200 bg-white px-4"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={() => removeImageAt(imageIndex)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={addImageField}
            >
              <Plus className="size-4" />
              Add gallery image
            </Button>
          </div>
        </FormField>
      </FormCard>

      <FormCard
        title="Submission"
        description="The server revalidates admin and storefront paths after successful mutations."
      >
        {submitError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <FormField
          label="Catalog summary"
          description="Quick review before saving the product record."
        >
          <Textarea
            readOnly
            value={[
              `Name: ${values.name || "Not set"}`,
              `Slug: ${toProductSlug(values.slug || values.name) || "Not set"}`,
              `Category: ${values.category || "Not set"}`,
              `Material: ${values.material || "Not set"}`,
              `Images: ${values.images.filter((image) => image.trim()).length}`,
            ].join("\n")}
            className="min-h-28 rounded-2xl border-stone-200 bg-stone-50"
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800"
            disabled={isSubmitting || isDeleting || isNavigating}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Saving
              </>
            ) : isEditMode ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              startNavigation(() => {
                router.push("/admin/products");
              });
            }}
            disabled={isSubmitting || isDeleting || isNavigating}
          >
            Back to products
          </Button>
        </div>
      </FormCard>
    </form>
  );
}
