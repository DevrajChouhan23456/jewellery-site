"use client";

import { startTransition, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDashed,
  FolderTree,
  LoaderCircle,
  Link2,
  Plus,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
  Tags,
  TrendingUp,
  Trash2,
  WandSparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import { megaMenuData } from "@/components/navbar/navbar-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  description: string;
  images: string[];
  material: string;
  name: string;
  price: string;
  size: string;
  slug: string;
  stock: string;
  subCategory: string;
  type: string;
};

const PRODUCT_DRAFT_KEY = "product-draft-v2";
const categories = [
  { value: "jewellery", label: "Jewellery" },
  { value: "gold", label: "Gold" },
  { value: "diamond", label: "Diamond" },
  { value: "earrings", label: "Earrings" },
  { value: "rings", label: "Rings" },
  { value: "gifting", label: "Gifting" },
  { value: "glamdays", label: "Daily Wear" },
  { value: "thejoydressing", label: "Collections" },
] as const;
const materials = ["gold", "diamond", "silver", "platinum"] as const;
const types = ["ring", "earring", "pendant", "necklace", "bangle", "chain", "bracelet", "mangalsutra"] as const;
const sizePresets = ["adjustable", "free-size", "small", "medium", "large"] as const;
const categoryLabelByValue = Object.fromEntries(
  categories.map((category) => [category.value, category.label]),
) as Record<string, string>;
const navbarCategoryByValue: Record<string, keyof typeof megaMenuData> = {
  jewellery: "All Jewellery",
  earrings: "Earrings",
  rings: "Rings",
  gifting: "Gifting",
  glamdays: "Daily Wear",
  thejoydressing: "Collections",
};
const fallbackSubCategoryPresets: Record<string, string[]> = {
  jewellery: ["pendants", "necklace-sets", "bracelets", "statement-sets", "gift-picks"],
  gold: ["gold-tone-basics", "minimal-rings", "chains", "daily-wear", "office-wear"],
  diamond: ["american-diamond-touch", "bridal-glam", "party-edit", "cocktail-rings", "gift-rings"],
  earrings: ["studs", "hoops", "drops", "jhumkas", "chandbalis", "ear-cuffs"],
  rings: ["adjustable-rings", "stack-rings", "cocktail-rings", "stone-rings", "daily-rings"],
  gifting: ["for-her", "birthday-gifts", "return-gifts", "wedding-favours", "gift-sets"],
  glamdays: ["office-wear", "minimal-sets", "pendants", "rings", "earrings"],
  thejoydressing: ["bridal-edit", "festive-edit", "statement-collection", "minimal-collection", "limited-drops"],
};

type PricingSuggestion = {
  suggestedPrice: number | null;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalSales: number;
  confidence: string;
};

const emptyValues: ProductFormValues = {
  category: "jewellery",
  description: "",
  images: [""],
  material: "gold",
  name: "",
  price: "",
  size: "",
  slug: "",
  stock: "24",
  subCategory: "",
  type: "ring",
};

function toFormValues(product?: {
  category?: string;
  description?: string | null;
  images?: string[];
  material?: string;
  name?: string;
  price?: number | string;
  size?: string | null;
  slug?: string;
  stock?: number | string;
  subCategory?: string | null;
  type?: string;
}) {
  if (!product) return emptyValues;

  return {
    category: product.category ?? emptyValues.category,
    description: product.description ?? "",
    images: product.images?.length ? product.images : [""],
    material: product.material ?? emptyValues.material,
    name: product.name ?? "",
    price: product.price !== undefined ? String(product.price) : "",
    size: product.size ?? "",
    slug: product.slug ?? "",
    stock: product.stock !== undefined ? String(product.stock) : emptyValues.stock,
    subCategory: product.subCategory ?? "",
    type: product.type ?? emptyValues.type,
  };
}

function getFirstFieldErrors(fieldErrors?: Record<string, string[] | undefined>) {
  if (!fieldErrors) return {};
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."]),
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTaxonomyLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getCategoryLabel(category: string) {
  return categoryLabelByValue[category] ?? formatTaxonomyLabel(category);
}

function getSubCategorySuggestions(category: string, type: string) {
  const navbarCategory = navbarCategoryByValue[category];
  const navbarSuggestions = navbarCategory
    ? megaMenuData[navbarCategory].groups.flat().map((option) => toProductSlug(option))
    : [];

  return Array.from(
    new Set(
      [...navbarSuggestions, ...(fallbackSubCategoryPresets[category] ?? []), type]
        .map((option) => toProductSlug(option))
        .filter((option) => option && !option.startsWith("all-")),
    ),
  ).slice(0, 12);
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState<PricingSuggestion | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialProduct?.slug));
  const [isNavigating, startNavigation] = useTransition();

  const isEditMode = Boolean(initialProduct?.id);
  const filledImageCount = values.images.filter((image) => image.trim()).length;
  const readinessChecks = useMemo(
    () => [
      { label: "Name and slug", complete: Boolean(values.name.trim() && toProductSlug(values.slug || values.name)) },
      { label: "Price and stock", complete: Boolean(values.price.trim() && values.stock.trim()) },
      { label: "Category, material, and type", complete: Boolean(values.category && values.material && values.type) },
      { label: "Description", complete: Boolean(values.description.trim()) },
      { label: "Primary image", complete: Boolean(values.images[0]?.trim()) },
    ],
    [values],
  );
  const completionPercent = Math.round(
    (readinessChecks.filter((item) => item.complete).length / readinessChecks.length) * 100,
  );
  const normalizedSlug = toProductSlug(values.slug || values.name);
  const normalizedSubCategory = values.subCategory ? toProductSlug(values.subCategory) : "";
  const selectedCategoryLabel = getCategoryLabel(values.category);
  const subCategorySuggestions = useMemo(
    () => getSubCategorySuggestions(values.category, values.type),
    [values.category, values.type],
  );
  const taxonomySummaryError =
    fieldErrors.slug || fieldErrors.category || fieldErrors.subCategory;

  useEffect(() => {
    if (isEditMode) return;

    const draft = localStorage.getItem(PRODUCT_DRAFT_KEY);
    if (!draft) return;

    try {
      const parsedDraft = JSON.parse(draft) as ProductFormValues & { savedAt?: string };
      const savedAt = parsedDraft.savedAt ? new Date(parsedDraft.savedAt) : null;
      if (savedAt && (Date.now() - savedAt.getTime()) / (1000 * 60 * 60) > 24) {
        localStorage.removeItem(PRODUCT_DRAFT_KEY);
        return;
      }

      setValues(toFormValues(parsedDraft));
      setLastSaved(savedAt);
      toast.success("Draft loaded from your previous session.");
    } catch {
      localStorage.removeItem(PRODUCT_DRAFT_KEY);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode) return;

    const timer = window.setInterval(() => {
      if (!values.name.trim()) return;
      setIsAutoSaving(true);
      localStorage.setItem(
        PRODUCT_DRAFT_KEY,
        JSON.stringify({ ...values, savedAt: new Date().toISOString() }),
      );
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isEditMode, values]);

  function setValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
    setSubmitError(null);
  }

  function handleNameChange(nextName: string) {
    setValue("name", nextName);
    if (!slugEdited) setValue("slug", toProductSlug(nextName));
  }

  function resetSlugToAutomatic() {
    setSlugEdited(false);
    setValue("slug", toProductSlug(values.name));
  }

  function updateImageAt(index: number, nextValue: string) {
    setValues((current) => {
      const nextImages = [...current.images];
      nextImages[index] = nextValue;
      return { ...current, images: nextImages };
    });
    setFieldErrors((current) => {
      if (!current.images) return current;
      const nextErrors = { ...current };
      delete nextErrors.images;
      return nextErrors;
    });
  }

  function removeImageAt(index: number) {
    setValues((current) => {
      const nextImages = current.images.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        images: nextImages.length > 0 ? nextImages : [""],
      };
    });
  }

  async function saveDraftNow() {
    if (isEditMode || !values.name.trim()) return;
    setIsAutoSaving(true);
    localStorage.setItem(
      PRODUCT_DRAFT_KEY,
      JSON.stringify({ ...values, savedAt: new Date().toISOString() }),
    );
    setLastSaved(new Date());
    setIsAutoSaving(false);
    toast.success("Draft saved.");
  }

  async function handleGenerateDescription() {
    if (!values.name || !values.material || !values.type || !values.category) {
      toast.error("Add the name, category, material, and type first.");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/admin/product/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          material: values.material,
          type: values.type,
          category: values.category,
        }),
      });
      const result = (await response.json().catch(() => null)) as { description?: string; error?: string } | null;
      if (!response.ok || !result?.description) throw new Error(result?.error || "Failed to generate description.");
      setValue("description", result.description);
      toast.success("Description generated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate description.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  async function handleGetPricingSuggestion() {
    if (!values.category || !values.material) {
      toast.error("Select category and material first.");
      return;
    }

    setIsLoadingPricing(true);
    try {
      const response = await fetch("/api/admin/product/pricing-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: initialProduct?.id,
          category: values.category,
          material: values.material,
        }),
      });
      const result = (await response.json().catch(() => null)) as (PricingSuggestion & { error?: string }) | null;
      if (!response.ok || !result) throw new Error(result?.error || "Failed to load pricing guidance.");
      setPricingSuggestion(result);
      toast.success("Pricing suggestion ready.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load pricing guidance.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoadingPricing(false);
    }
  }

  async function handleDelete() {
    if (!initialProduct?.id) return;
    if (!window.confirm(`Delete "${initialProduct.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
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
      size: values.size,
      stock: values.stock,
      category: values.category,
      subCategory: values.subCategory,
      material: values.material,
      type: values.type,
      images: values.images,
      description: values.description,
      ...(initialProduct?.id ? { id: initialProduct.id } : {}),
    };

    if (initialProduct?.id) {
      const parsed = updateProductSchema.safeParse(payload);

      if (!parsed.success) {
        setFieldErrors(getFirstFieldErrors(parsed.error.flatten().fieldErrors));
        setSubmitError("Please fix the highlighted fields before saving.");
        toast.error("Please fix the highlighted fields.");
        return;
      }

      setIsSubmitting(true);

      try {
        await updateAdminProductRequest(parsed.data);
        toast.success("Product updated.");
        startTransition(() => router.refresh());
      } catch (error) {
        const nextFieldErrors = getFirstFieldErrors(getProductApiFieldErrors(error));
        if (Object.keys(nextFieldErrors).length > 0) setFieldErrors(nextFieldErrors);
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
      setFieldErrors(getFirstFieldErrors(parsed.error.flatten().fieldErrors));
      setSubmitError("Please fix the highlighted fields before saving.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
        const result = await createAdminProductRequest(parsed.data);
        localStorage.removeItem(PRODUCT_DRAFT_KEY);
        toast.success("Product created.");
        startNavigation(() => {
          router.push(`/admin/products/${result.product.id}`);
          router.refresh();
        });
    } catch (error) {
      const nextFieldErrors = getFirstFieldErrors(getProductApiFieldErrors(error));
      if (Object.keys(nextFieldErrors).length > 0) setFieldErrors(nextFieldErrors);
      const message = error instanceof Error ? error.message : "Save failed.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <FormCard
          title={isEditMode ? "Edit product" : "Create product"}
          description={isEditMode ? "Update the catalog record with clearer controls." : "Faster product entry with smarter defaults, AI help, and draft safety."}
          action={isEditMode ? (
            <Button type="button" variant="destructive" className="rounded-full" onClick={handleDelete} disabled={isDeleting || isSubmitting || isNavigating}>
              {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {isDeleting ? "Deleting" : "Delete"}
            </Button>
          ) : null}
        >
          <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,#fffdf9_0%,#f7f2ea_60%,#edf7fb_100%)] p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-900">
              <Sparkles className="size-3.5" />
              Product Studio
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
              {values.name.trim() || "Start a new catalog entry"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              The slug stays automatic until you edit it, the draft saves locally,
              and pricing guidance is one click away.
            </p>
          </div>

          <FormGroup columns={2}>
            <FormField label="Product name" description="Customer-facing title used across the storefront." error={fieldErrors.name}>
              <Input value={values.name} onChange={(event) => handleNameChange(event.target.value)} placeholder="Classic diamond ring" className="h-11 rounded-xl border-stone-200 bg-white px-4" />
            </FormField>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-stone-950">Routing & taxonomy</p>
                <p className="mt-1 text-xs text-stone-500">
                  Keep the form cleaner here. Edit the slug, category, and
                  sub-category in a side drawer.
                </p>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="group w-full rounded-[1.4rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,247,240,0.96))] p-4 text-left shadow-[0_18px_40px_-28px_rgba(28,25,23,0.28)] transition hover:border-amber-200 hover:shadow-[0_24px_50px_-32px_rgba(28,25,23,0.34)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full border-stone-200 bg-white/90 px-3 py-1 text-stone-700"
                          >
                            <Link2 className="size-3.5" />
                            {normalizedSlug || "slug-pending"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full border-stone-200 bg-white/90 px-3 py-1 text-stone-700"
                          >
                            <FolderTree className="size-3.5" />
                            {selectedCategoryLabel}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full border-stone-200 bg-white/90 px-3 py-1 text-stone-700"
                          >
                            <Tags className="size-3.5" />
                            {normalizedSubCategory
                              ? formatTaxonomyLabel(normalizedSubCategory)
                              : "Sub-category optional"}
                          </Badge>
                        </div>

                        <div className="grid gap-2 text-xs text-stone-500 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/80 bg-white/75 px-3 py-2">
                            <p className="font-medium text-stone-900">URL preview</p>
                            <p className="mt-1 truncate">
                              {normalizedSlug
                                ? `/product/${normalizedSlug}`
                                : "Generated from the product name"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/80 bg-white/75 px-3 py-2">
                            <p className="font-medium text-stone-900">Grouping</p>
                            <p className="mt-1">
                              {selectedCategoryLabel}
                              {normalizedSubCategory
                                ? ` / ${formatTaxonomyLabel(normalizedSubCategory)}`
                                : " / No sub-category"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 transition group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:text-amber-800">
                        <SlidersHorizontal className="size-4" />
                      </div>
                    </div>
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-full max-w-none border-l border-stone-200 bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_48%,#f7fbfc_100%)] p-0 sm:max-w-[540px]"
                >
                  <SheetHeader className="border-b border-stone-200 bg-white/90 px-6 py-6 sm:px-7">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-stone-950 px-3 py-1 text-white">
                        {slugEdited ? "Manual slug" : "Auto slug"}
                      </Badge>
                      <Badge className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-stone-700">
                        {selectedCategoryLabel}
                      </Badge>
                      <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900">
                        {normalizedSubCategory ? "Sub-category set" : "Sub-category optional"}
                      </Badge>
                    </div>
                    <SheetTitle className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                      Routing & taxonomy
                    </SheetTitle>
                    <SheetDescription className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                      Fine-tune the product URL and secondary grouping here
                      without crowding the main form.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
                    <div className="rounded-[1.6rem] border border-stone-200 bg-[linear-gradient(135deg,#fffefc_0%,#f8f2e9_65%,#eef7fb_100%)] p-5 shadow-[0_20px_40px_-30px_rgba(28,25,23,0.3)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        Preview
                      </p>
                      <div className="mt-3 space-y-3">
                        <div className="rounded-[1.2rem] border border-white/80 bg-white/85 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            Product URL
                          </p>
                          <p className="mt-2 text-base font-semibold text-stone-950">
                            {normalizedSlug ? `/product/${normalizedSlug}` : "/product/<generated-from-name>"}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/80 bg-white/85 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            Catalog path
                          </p>
                          <p className="mt-2 text-sm font-medium text-stone-700">
                            {selectedCategoryLabel}
                            {normalizedSubCategory
                              ? ` / ${formatTaxonomyLabel(normalizedSubCategory)}`
                              : " / Standalone in category"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      <FormField
                        label="Category"
                        description="Primary storefront grouping for this product."
                        error={fieldErrors.category}
                      >
                        <div className="space-y-3">
                          <select
                            value={values.category}
                            onChange={(event) => setValue("category", event.target.value)}
                            className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                          >
                            {categories.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="rounded-[1.2rem] border border-stone-200 bg-stone-50/80 px-4 py-3 text-xs text-stone-600">
                            Products in this category group under{" "}
                            <span className="font-semibold text-stone-900">
                              {selectedCategoryLabel}
                            </span>{" "}
                            before any sub-category split.
                          </div>
                        </div>
                      </FormField>

                      <FormField
                        label="Slug"
                        description="Stable URL identifier. It follows the name until you manually override it."
                        error={fieldErrors.slug}
                      >
                        <div className="space-y-3">
                          <Input
                            value={values.slug}
                            onChange={(event) => {
                              setSlugEdited(true);
                              setValue("slug", event.target.value);
                            }}
                            placeholder="classic-diamond-ring"
                            className="h-11 rounded-xl border-stone-200 bg-white px-4"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border-stone-200 bg-white"
                              onClick={resetSlugToAutomatic}
                            >
                              <RefreshCcw className="size-3.5" />
                              Reset to automatic
                            </Button>
                            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600">
                              {normalizedSlug
                                ? `Live path: /product/${normalizedSlug}`
                                : "A slug will be generated from the product name"}
                            </span>
                          </div>
                        </div>
                      </FormField>

                      <FormField
                        label="Sub-category"
                        description="Optional deeper grouping for filtered catalog views."
                        error={fieldErrors.subCategory}
                      >
                        <div className="space-y-3">
                          <Input
                            value={values.subCategory}
                            onChange={(event) => setValue("subCategory", event.target.value)}
                            placeholder="engagement-rings"
                            className="h-11 rounded-xl border-stone-200 bg-white px-4"
                          />
                          <div className="rounded-[1.2rem] border border-stone-200 bg-stone-50/80 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                Suggested options
                              </p>
                              {values.subCategory ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-full px-2 text-stone-500 hover:text-stone-900"
                                  onClick={() => setValue("subCategory", "")}
                                >
                                  Clear
                                </Button>
                              ) : null}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {subCategorySuggestions.map((option) => {
                                const isActive = normalizedSubCategory === option;
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => setValue("subCategory", option)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                      isActive
                                        ? "border-stone-950 bg-stone-950 text-white"
                                        : "border-stone-200 bg-white text-stone-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900"
                                    }`}
                                  >
                                    {formatTaxonomyLabel(option)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </FormField>

                      <div className="rounded-[1.3rem] border border-stone-200 bg-white/90 p-4">
                        <p className="text-sm font-semibold text-stone-950">
                          What this changes
                        </p>
                        <div className="mt-3 grid gap-3 text-sm text-stone-600">
                          <div className="rounded-2xl border border-stone-100 bg-stone-50/80 px-4 py-3">
                            The slug controls the storefront URL and stays
                            automatic until you edit it.
                          </div>
                          <div className="rounded-2xl border border-stone-100 bg-stone-50/80 px-4 py-3">
                            Sub-category helps organize product clusters inside{" "}
                            {selectedCategoryLabel.toLowerCase()}.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="border-t border-stone-200 bg-white/90 px-6 py-4 sm:px-7">
                    <p className="text-xs text-stone-500">
                      Changes apply instantly to the form and save with the
                      product.
                    </p>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        className="rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800"
                      >
                        Done
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {taxonomySummaryError ? (
                <p className="text-xs text-red-600">{taxonomySummaryError}</p>
              ) : null}
            </div>
          </FormGroup>

          <FormGroup columns={2}>
            <FormField label="Price (INR)" description="Whole-number selling price." error={fieldErrors.price}>
              <Input type="number" min={0} step={1} value={values.price} onChange={(event) => setValue("price", event.target.value)} placeholder="24999" className="h-11 rounded-xl border-stone-200 bg-white px-4" />
            </FormField>
            <FormField label="Stock" description="Inventory count used for selling and alerts." error={fieldErrors.stock}>
              <Input type="number" min={0} step={1} value={values.stock} onChange={(event) => setValue("stock", event.target.value)} placeholder="24" className="h-11 rounded-xl border-stone-200 bg-white px-4" />
            </FormField>
          </FormGroup>

          <FormGroup columns={2}>
            <FormField label="Material" description="Material label used in filters and copy." error={fieldErrors.material}>
              <select value={values.material} onChange={(event) => setValue("material", event.target.value)} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100">
                {materials.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
            <FormField label="Type" description="Product type used for search and AI copy." error={fieldErrors.type}>
              <select value={values.type} onChange={(event) => setValue("type", event.target.value)} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100">
                {types.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
          </FormGroup>

          <FormField label="Size" description="Optional size or fit note." error={fieldErrors.size}>
            <div className="space-y-3">
              <Input value={values.size} onChange={(event) => setValue("size", event.target.value)} placeholder="adjustable" className="h-11 rounded-xl border-stone-200 bg-white px-4" />
              <div className="flex flex-wrap gap-2">
                {sizePresets.map((preset) => (
                  <button key={preset} type="button" onClick={() => setValue("size", preset)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${values.size === preset ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"}`}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </FormField>
        </FormCard>

        <FormCard title="Description" description="Write the product story or let AI draft the first version.">
          <FormField label="Product description" description="A short, polished description improves both selling and search." error={fieldErrors.description}>
            <div className="space-y-3">
              <Textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} placeholder="Describe the finish, styling mood, and where the piece works best..." className="min-h-32 rounded-xl border-stone-200 bg-white px-4 py-3" rows={6} />
              <Button type="button" variant="outline" className="rounded-full" onClick={handleGenerateDescription} disabled={isGeneratingDescription}>
                {isGeneratingDescription ? <LoaderCircle className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
                {isGeneratingDescription ? "Generating" : "Generate with AI"}
              </Button>
            </div>
          </FormField>
        </FormCard>

        <FormCard title="Media" description="Lead with one strong hero image, then add optional gallery support shots.">
          <FormField label="Primary image" description="The first image becomes the storefront preview." error={fieldErrors.images}>
            <ImageGallery label="Primary product image" selectedImage={values.images[0] ?? ""} onImageSelect={(url) => updateImageAt(0, url)} />
          </FormField>
          <FormField label="Additional gallery images" description="Optional alternate angles or close-ups.">
            <div className="space-y-3">
              {values.images.slice(1).map((image, index) => {
                const imageIndex = index + 1;
                return (
                  <div key={`product-image-${imageIndex}`} className="flex gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50/80 p-3">
                    <Input value={image} onChange={(event) => updateImageAt(imageIndex, event.target.value)} placeholder="https://..." className="h-11 rounded-xl border-stone-200 bg-white px-4" />
                    <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => removeImageAt(imageIndex)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setValues((current) => ({ ...current, images: [...current.images, ""] }))}>
                <Plus className="size-4" />
                Add gallery image
              </Button>
            </div>
          </FormField>
        </FormCard>
      </div>

      <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <FormCard title="Publishing pulse" description="A quick view of what is ready and what still needs attention.">
          {!isEditMode ? (
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4 text-sm text-stone-600">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{isAutoSaving ? "Saving draft..." : lastSaved ? `Draft saved ${lastSaved.toLocaleTimeString()}` : "Draft not saved yet"}</span>
                <Button type="button" variant="outline" className="rounded-full" onClick={saveDraftNow} disabled={isAutoSaving}>
                  Save draft
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>Completion</span>
              <span className="font-medium text-stone-950">{completionPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#1c1917_0%,#d6a75c_60%,#67e8f9_100%)]" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            {readinessChecks.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50/80 px-4 py-3">
                <div className={`mt-0.5 flex size-6 items-center justify-center rounded-full ${item.complete ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>
                  {item.complete ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{item.label}</p>
                  <p className="text-xs text-stone-500">{item.complete ? "Ready" : "Still missing"}</p>
                </div>
              </div>
            ))}
          </div>
        </FormCard>

        <FormCard title="Pricing assistant" description="Use catalog history to anchor pricing before you publish.">
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={handleGetPricingSuggestion} disabled={isLoadingPricing}>
            {isLoadingPricing ? <LoaderCircle className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
            {isLoadingPricing ? "Analyzing price" : "Get price suggestion"}
          </Button>

          {pricingSuggestion ? (
            <div className="space-y-3 rounded-[1.5rem] border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
              {pricingSuggestion.suggestedPrice !== null ? (
                <div className="rounded-[1.25rem] border border-sky-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Suggested</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-sky-950">{formatCurrency(pricingSuggestion.suggestedPrice)}</p>
                  <Button type="button" variant="outline" className="mt-3 rounded-full border-sky-200 bg-white text-sky-800 hover:bg-sky-100" onClick={() => setValue("price", String(pricingSuggestion.suggestedPrice))}>
                    Use suggested price
                  </Button>
                </div>
              ) : null}
              <p>Average: {formatCurrency(pricingSuggestion.averagePrice)}</p>
              <p>Range: {formatCurrency(pricingSuggestion.minPrice)} to {formatCurrency(pricingSuggestion.maxPrice)}</p>
              <p>Confidence: {pricingSuggestion.confidence}</p>
              <p>Matched sales: {pricingSuggestion.totalSales}</p>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4 text-sm text-stone-600">
              Choose category and material, then run pricing guidance to get a suggested range.
            </div>
          )}
        </FormCard>

        <FormCard title="Submission" description="Final review before you create or update the product.">
          {submitError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div> : null}
          <FormField label="Catalog summary" description="A compact review of the current setup.">
            <Textarea readOnly value={[
              `Name: ${values.name || "Not set"}`,
              `Slug: ${normalizedSlug || "Not set"}`,
              `Price: ${values.price ? formatCurrency(Number(values.price)) : "Not set"}`,
              `Stock: ${values.stock || "Not set"}`,
              `Category: ${selectedCategoryLabel || "Not set"}`,
              `Sub-category: ${normalizedSubCategory || "Not set"}`,
              `Material: ${values.material || "Not set"}`,
              `Type: ${values.type || "Not set"}`,
              `Description: ${values.description ? "Ready" : "Missing"}`,
              `Images: ${filledImageCount}`,
            ].join("\n")} className="min-h-40 rounded-2xl border-stone-200 bg-stone-50" />
          </FormField>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800" disabled={isSubmitting || isDeleting || isNavigating}>
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isSubmitting ? "Saving" : isEditMode ? "Save changes" : "Create product"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => startNavigation(() => router.push("/admin/products"))} disabled={isSubmitting || isDeleting || isNavigating}>
              Back to products
            </Button>
          </div>
        </FormCard>
      </div>
    </form>
  );
}
