"use client";

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Sparkles, TrendingUp, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { FormCard, FormField, FormGroup } from "@/components/admin/FormComponents";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createProductSchema,
  toProductSlug,
  updateProductSchema,
} from "@/lib/validations/product";

export type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  subCategory: string | null;
  material: string;
  type: string;
  images: string[];
  description?: string;
};

type ProductFormValues = {
  category: string;
  images: string[];
  material: string;
  name: string;
  price: string;
  slug: string;
  subCategory: string;
  type: string;
  description: string;
};

type ProductApiResponse = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  product?: ProductFormInitialData;
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
  description: "",
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
    description: product.description ?? "",
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState<{
    suggestedPrice: number | null;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    totalSales: number;
    confidence: string;
  } | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

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

  async function handleGenerateDescription() {
    if (!values.name || !values.material || !values.type) {
      toast.error("Please fill in name, material, and type first.");
      return;
    }

    setIsGeneratingDescription(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/product/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          material: values.material,
          type: values.type,
          category: values.category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description.");
      }

      const result = await response.json();
      setValue("description", result.description);
      toast.success("Description generated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  async function handleGetPricingSuggestion() {
    if (!values.category || !values.material) {
      toast.error("Please fill in category and material first.");
      return;
    }

    setIsLoadingPricing(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/product/pricing-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: initialProduct?.id,
          category: values.category,
          material: values.material,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get pricing suggestion.");
      }

      const result = await response.json();
      setPricingSuggestion(result);
      toast.success("Pricing suggestion loaded!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get pricing suggestion.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoadingPricing(false);
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
      const response = await fetch("/api/admin/product/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: initialProduct.id }),
      });
      const result = (await response.json().catch(() => null)) as ProductApiResponse | null;

      if (!response.ok) {
        throw new Error(result?.error || "Delete failed.");
      }

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
      description: values.description,
      ...(initialProduct?.id ? { id: initialProduct.id } : {}),
    };
    const schema = initialProduct?.id ? updateProductSchema : createProductSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const nextFieldErrors = getFirstFieldErrors(parsed.error.flatten().fieldErrors);
      setFieldErrors(nextFieldErrors);
      setSubmitError("Please fix the highlighted fields before saving.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        initialProduct?.id ? "/api/admin/product/update" : "/api/admin/product/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = (await response.json().catch(() => null)) as ProductApiResponse | null;

      if (!response.ok) {
        const nextFieldErrors = getFirstFieldErrors(result?.fieldErrors);
        if (Object.keys(nextFieldErrors).length > 0) {
          setFieldErrors(nextFieldErrors);
        }

        throw new Error(result?.error || "Save failed.");
      }

      toast.success(initialProduct?.id ? "Product updated." : "Product created.");

      const createdProductId = result?.product?.id;

      if (!initialProduct?.id && createdProductId) {
        startNavigation(() => {
          router.push(`/admin/products/${createdProductId}`);
          router.refresh();
        });
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
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
            <div className="space-y-3">
              <Input
                type="number"
                min={0}
                step={1}
                value={values.price}
                onChange={(event) => setValue("price", event.target.value)}
                placeholder="24999"
                className="h-11 rounded-xl border-stone-200 bg-white px-4"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={handleGetPricingSuggestion}
                disabled={isLoadingPricing || !values.category || !values.material}
              >
                {isLoadingPricing ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="size-4" />
                    Get Price Suggestion
                  </>
                )}
              </Button>
              {pricingSuggestion && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <div className="font-medium text-blue-900">Pricing Analysis</div>
                  <div className="mt-1 space-y-1 text-blue-800">
                    {pricingSuggestion.suggestedPrice && (
                      <div>Suggested: ₹{pricingSuggestion.suggestedPrice.toLocaleString()}</div>
                    )}
                    <div>Average: ₹{pricingSuggestion.averagePrice.toLocaleString()}</div>
                    <div>Range: ₹{pricingSuggestion.minPrice.toLocaleString()} - ₹{pricingSuggestion.maxPrice.toLocaleString()}</div>
                    <div>Sales: {pricingSuggestion.totalSales} units</div>
                    <div>Confidence: {pricingSuggestion.confidence}</div>
                  </div>
                </div>
              )}
            </div>
          </FormField>

<FormField
            label="Category"
            description="Primary storefront grouping and shop-page slug."
            error={fieldErrors.category}
          >
            <select
              value={values.category}
              onChange={(event) => setValue("category", event.target.value)}
              className="h-11 rounded-xl border-stone-200 bg-white px-4 w-full"
            >
              <option value="jewellery">Jewellery</option>
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
              <option value="earrings">Earrings</option>
              <option value="rings">Rings</option>
              <option value="gifting">Gifting</option>
              <option value="glamdays">Daily Wear</option>
              <option value="thejoydressing">Collections</option>
            </select>
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
            <select
              value={values.material}
              onChange={(event) => setValue("material", event.target.value)}
              className="h-11 rounded-xl border-stone-200 bg-white px-4 w-full"
            >
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
              <option value="silver">Silver</option>
            </select>
          </FormField>
        </FormGroup>

<FormField
          label="Type"
          description="Specific product type used in search and taxonomy."
          error={fieldErrors.type}
        >
          <select
            value={values.type}
            onChange={(event) => setValue("type", event.target.value)}
            className="h-11 rounded-xl border-stone-200 bg-white px-4 w-full"
          >
            <option value="ring">Ring</option>
            <option value="earring">Earring</option>
            <option value="pendant">Pendant</option>
            <option value="necklace">Necklace</option>
            <option value="bangle">Bangle</option>
            <option value="chain">Chain</option>
            <option value="bracelet">Bracelet</option>
            <option value="mangalsutra">Mangalsutra</option>
          </select>
        </FormField>

        <FormField
          label="Description"
          description="Product description for storefront display."
          error={fieldErrors.description}
        >
          <div className="space-y-3">
            <Textarea
              value={values.description}
              onChange={(event) => setValue("description", event.target.value)}
              placeholder="Describe the product features, materials, and appeal..."
              className="min-h-24 rounded-xl border-stone-200 bg-white px-4 py-3"
              rows={4}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription || !values.name || !values.material || !values.type}
            >
              {isGeneratingDescription ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
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
              `Description: ${values.description ? "Set" : "Not set"}`,
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
