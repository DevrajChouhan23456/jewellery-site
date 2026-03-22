"use client";

import Image from "next/image";
import { startTransition, useState } from "react";
import { ImageIcon, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

type HomepageSectionKey = "category" | "trending" | "arrival" | "gender";

type HeroSlide = {
  id: string;
  imageUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
};

type HomepageSection = {
  id: string;
  key: HomepageSectionKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type HomepageCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  link: string;
  badge: string | null;
  order: number;
};

type ShopFeature = {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  order: number;
};

type ShopProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  badge: string;
  lowStockText: string;
  order: number;
};

type ShopPage = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  resultCount: number;
  features: ShopFeature[];
  products: ShopProduct[];
};

type StorefrontData = {
  heroSlides: HeroSlide[];
  homepageSections: HomepageSection[];
  homepageCards: Record<HomepageSectionKey, HomepageCard[]>;
  shopPages: ShopPage[];
};

type StorefrontEditorProps = {
  initialData: StorefrontData;
};

const sectionOrder: HomepageSectionKey[] = [
  "category",
  "trending",
  "arrival",
  "gender",
];

const presetAssets = [
  { label: "Women edit", value: "/images/sbg-women.jpg" },
  { label: "Men edit", value: "/images/sbg-men.webp" },
  { label: "Kids edit", value: "/images/sbg-kids.webp" },
];

function createId() {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function prettySectionName(key: HomepageSectionKey) {
  switch (key) {
    case "category":
      return "Category Grid";
    case "trending":
      return "Trending Section";
    case "arrival":
      return "New Arrivals";
    case "gender":
      return "Shop by Gender";
  }
}

function SectionField({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="min-h-28 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-300"
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-amber-300"
        />
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { imageUrl?: string; error?: string };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Upload failed.");
      }

      onChange(data.imageUrl);
      toast.success("Image uploaded.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-stone-700">{label}</span>

      <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50">
        <div className="relative aspect-[1.5]">
          {value ? (
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-stone-500">
              <ImageIcon className="size-4" />
              No image selected
            </div>
          )}
        </div>
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-amber-300"
      />

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-300">
          {isUploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {isUploading ? "Uploading..." : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>

        {presetAssets.map((asset) => (
          <button
            key={asset.value}
            type="button"
            onClick={() => onChange(asset.value)}
            className="rounded-full bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-200"
          >
            {asset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 luxury-shadow backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-stone-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StorefrontEditor({ initialData }: StorefrontEditorProps) {
  const [heroSlides, setHeroSlides] = useState(initialData.heroSlides);
  const [homepageSections, setHomepageSections] = useState(
    initialData.homepageSections,
  );
  const [homepageCards, setHomepageCards] = useState(initialData.homepageCards);
  const [shopPages, setShopPages] = useState(initialData.shopPages);
  const [activePanel, setActivePanel] = useState<"hero" | "homepage" | "shop">(
    "hero",
  );
  const [activeShopSlug, setActiveShopSlug] = useState(
    initialData.shopPages[0]?.slug ?? "jewellery",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const activeShopPage =
    shopPages.find((page) => page.slug === activeShopSlug) ?? shopPages[0];

  const updateSlide = (
    id: string,
    field: keyof HeroSlide,
    value: string | number,
  ) => {
    setHeroSlides((current) =>
      current.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  const updateHomepageSection = (
    key: HomepageSectionKey,
    field: keyof HomepageSection,
    value: string,
  ) => {
    setHomepageSections((current) =>
      current.map((section) =>
        section.key === key ? { ...section, [field]: value } : section,
      ),
    );
  };

  const updateHomepageCard = (
    key: HomepageSectionKey,
    id: string,
    field: keyof HomepageCard,
    value: string | number | null,
  ) => {
    setHomepageCards((current) => ({
      ...current,
      [key]: current[key].map((card) =>
        card.id === id ? { ...card, [field]: value } : card,
      ),
    }));
  };

  const updateShopPage = (
    slug: string,
    field: keyof ShopPage,
    value: string | number,
  ) => {
    setShopPages((current) =>
      current.map((page) =>
        page.slug === slug ? { ...page, [field]: value } : page,
      ),
    );
  };

  const updateShopFeature = (
    slug: string,
    id: string,
    field: keyof ShopFeature,
    value: string | number,
  ) => {
    setShopPages((current) =>
      current.map((page) =>
        page.slug !== slug
          ? page
          : {
              ...page,
              features: page.features.map((feature) =>
                feature.id === id ? { ...feature, [field]: value } : feature,
              ),
            },
      ),
    );
  };

  const updateShopProduct = (
    slug: string,
    id: string,
    field: keyof ShopProduct,
    value: string | number,
  ) => {
    setShopPages((current) =>
      current.map((page) =>
        page.slug !== slug
          ? page
          : {
              ...page,
              products: page.products.map((product) =>
                product.id === id ? { ...product, [field]: value } : product,
              ),
            },
      ),
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/storefront", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            heroSlides,
            homepageSections,
            homepageCards,
            shopPages,
          }),
        });
        const data = (await response.json()) as StorefrontData & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to save storefront content.");
        }

        setHeroSlides(data.heroSlides);
        setHomepageSections(data.homepageSections);
        setHomepageCards(data.homepageCards);
        setShopPages(data.shopPages);
        setActiveShopSlug((current) =>
          data.shopPages.find((page) => page.slug === current)?.slug ??
          data.shopPages[0]?.slug ??
          "jewellery",
        );
        toast.success("Storefront content updated.");
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "We couldn't save those changes.";
        setSaveError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-20 rounded-[2rem] border border-white/80 bg-white/85 p-4 luxury-shadow backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "hero", label: "Hero Slides" },
              { key: "homepage", label: "Homepage Sections" },
              { key: "shop", label: "Shop Pages" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setActivePanel(item.key as "hero" | "homepage" | "shop")
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activePanel === item.key
                    ? "bg-stone-950 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Storefront"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}

      {activePanel === "hero" ? (
        <SectionCard
          title="Hero slider"
          action={
            <button
              type="button"
              onClick={() =>
                setHeroSlides((current) => [
                  ...current,
                  {
                    id: createId(),
                    imageUrl: "/images/sbg-women.jpg",
                    badge: "New Slide",
                    title: "A fresh campaign story",
                    subtitle: "Add your seasonal hero copy here.",
                    ctaLabel: "Shop Now",
                    ctaHref: "/shop/jewellery",
                    order: current.length + 1,
                  },
                ])
              }
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              Add slide
            </button>
          }
        >
          <div className="grid gap-5">
            {heroSlides
              .slice()
              .sort((first, second) => first.order - second.order)
              .map((slide) => (
                <div
                  key={slide.id}
                  className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">
                        Slide #{slide.order}
                      </p>
                      <p className="text-sm text-stone-500">
                        Edit the image, overlay text, and destination.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setHeroSlides((current) =>
                          current.filter((item) => item.id !== slide.id),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ImageField
                      label="Image"
                      value={slide.imageUrl}
                      onChange={(value) => updateSlide(slide.id, "imageUrl", value)}
                    />
                    <SectionField
                      label="Order"
                      value={slide.order}
                      type="number"
                      onChange={(value) =>
                        updateSlide(slide.id, "order", Number(value) || 0)
                      }
                    />
                    <SectionField
                      label="Badge"
                      value={slide.badge}
                      onChange={(value) => updateSlide(slide.id, "badge", value)}
                    />
                    <SectionField
                      label="CTA label"
                      value={slide.ctaLabel}
                      onChange={(value) => updateSlide(slide.id, "ctaLabel", value)}
                    />
                    <SectionField
                      label="Title"
                      value={slide.title}
                      onChange={(value) => updateSlide(slide.id, "title", value)}
                    />
                    <SectionField
                      label="CTA href"
                      value={slide.ctaHref}
                      onChange={(value) => updateSlide(slide.id, "ctaHref", value)}
                    />
                    <div className="md:col-span-2">
                      <SectionField
                        label="Subtitle"
                        value={slide.subtitle}
                        multiline
                        onChange={(value) => updateSlide(slide.id, "subtitle", value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      ) : null}

      {activePanel === "homepage" ? (
        <div className="space-y-6">
          {sectionOrder.map((key) => {
            const section = homepageSections.find((item) => item.key === key);

            if (!section) {
              return null;
            }

            return (
              <SectionCard
                key={key}
                title={prettySectionName(key)}
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setHomepageCards((current) => ({
                        ...current,
                        [key]: [
                          ...current[key],
                          {
                            id: createId(),
                            title: "New card",
                            subtitle: "Add supporting copy here.",
                            image: "/images/sbg-women.jpg",
                            link: "/shop/jewellery",
                            badge: "",
                            order: current[key].length + 1,
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                  >
                    <Plus className="size-4" />
                    Add card
                  </button>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <SectionField
                    label="Eyebrow"
                    value={section.eyebrow}
                    onChange={(value) => updateHomepageSection(key, "eyebrow", value)}
                  />
                  <SectionField
                    label="Title"
                    value={section.title}
                    onChange={(value) => updateHomepageSection(key, "title", value)}
                  />
                  <SectionField
                    label="Subtitle"
                    value={section.subtitle}
                    onChange={(value) => updateHomepageSection(key, "subtitle", value)}
                  />
                  <SectionField
                    label="CTA label"
                    value={section.ctaLabel}
                    onChange={(value) => updateHomepageSection(key, "ctaLabel", value)}
                  />
                  <SectionField
                    label="CTA href"
                    value={section.ctaHref}
                    onChange={(value) => updateHomepageSection(key, "ctaHref", value)}
                  />
                  <div className="md:col-span-2">
                    <SectionField
                      label="Description"
                      value={section.description}
                      multiline
                      onChange={(value) =>
                        updateHomepageSection(key, "description", value)
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {homepageCards[key]
                    .slice()
                    .sort((first, second) => first.order - second.order)
                    .map((card) => (
                      <div
                        key={card.id}
                        className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-stone-950">
                              {card.title}
                            </p>
                            <p className="text-sm text-stone-500">
                              Card order #{card.order}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setHomepageCards((current) => ({
                                ...current,
                                [key]: current[key].filter(
                                  (item) => item.id !== card.id,
                                ),
                              }))
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <SectionField
                            label="Title"
                            value={card.title}
                            onChange={(value) =>
                              updateHomepageCard(key, card.id, "title", value)
                            }
                          />
                          <SectionField
                            label="Order"
                            value={card.order}
                            type="number"
                            onChange={(value) =>
                              updateHomepageCard(
                                key,
                                card.id,
                                "order",
                                Number(value) || 0,
                              )
                            }
                          />
                          <ImageField
                            label="Image"
                            value={card.image ?? ""}
                            onChange={(value) =>
                              updateHomepageCard(key, card.id, "image", value)
                            }
                          />
                          <SectionField
                            label="Link"
                            value={card.link}
                            onChange={(value) =>
                              updateHomepageCard(key, card.id, "link", value)
                            }
                          />
                          <SectionField
                            label="Badge"
                            value={card.badge ?? ""}
                            onChange={(value) =>
                              updateHomepageCard(key, card.id, "badge", value)
                            }
                          />
                          <div className="md:col-span-2">
                            <SectionField
                              label="Subtitle"
                              value={card.subtitle}
                              multiline
                              onChange={(value) =>
                                updateHomepageCard(key, card.id, "subtitle", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      ) : null}

      {activePanel === "shop" && activeShopPage ? (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <SectionCard title="Category pages">
            <div className="flex flex-col gap-2">
              {shopPages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => setActiveShopSlug(page.slug)}
                  className={`rounded-[1.25rem] px-4 py-3 text-left text-sm font-medium transition ${
                    activeShopSlug === page.slug
                      ? "bg-stone-950 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title={`${activeShopPage.title} settings`}>
              <div className="grid gap-4 md:grid-cols-2">
                <SectionField
                  label="Result count"
                  value={activeShopPage.resultCount}
                  type="number"
                  onChange={(value) =>
                    updateShopPage(
                      activeShopPage.slug,
                      "resultCount",
                      Number(value) || 0,
                    )
                  }
                />
                <SectionField
                  label="Title"
                  value={activeShopPage.title}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "title", value)
                  }
                />
                <SectionField
                  label="Subtitle"
                  value={activeShopPage.subtitle}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "subtitle", value)
                  }
                />
                <SectionField
                  label="Hero eyebrow"
                  value={activeShopPage.heroEyebrow}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "heroEyebrow", value)
                  }
                />
                <ImageField
                  label="Hero image"
                  value={activeShopPage.heroImageUrl}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "heroImageUrl", value)
                  }
                />
                <SectionField
                  label="Hero CTA label"
                  value={activeShopPage.heroCtaLabel}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "heroCtaLabel", value)
                  }
                />
                <SectionField
                  label="Hero CTA href"
                  value={activeShopPage.heroCtaHref}
                  onChange={(value) =>
                    updateShopPage(activeShopPage.slug, "heroCtaHref", value)
                  }
                />
                <div className="md:col-span-2">
                  <SectionField
                    label="Hero title"
                    value={activeShopPage.heroTitle}
                    multiline
                    onChange={(value) =>
                      updateShopPage(activeShopPage.slug, "heroTitle", value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <SectionField
                    label="Hero description"
                    value={activeShopPage.heroDescription}
                    multiline
                    onChange={(value) =>
                      updateShopPage(activeShopPage.slug, "heroDescription", value)
                    }
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Feature cards"
              action={
                <button
                  type="button"
                  onClick={() =>
                    setShopPages((current) =>
                      current.map((page) =>
                        page.slug !== activeShopPage.slug
                          ? page
                          : {
                              ...page,
                              features: [
                                ...page.features,
                                {
                                  id: createId(),
                                  title: "New feature",
                                  imageUrl: "/images/sbg-women.jpg",
                                  href: `/shop/${page.slug}`,
                                  order: page.features.length + 1,
                                },
                              ],
                            },
                      ),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                >
                  <Plus className="size-4" />
                  Add feature
                </button>
              }
            >
              <div className="grid gap-4">
                {activeShopPage.features
                  .slice()
                  .sort((first, second) => first.order - second.order)
                  .map((feature) => (
                    <div
                      key={feature.id}
                      className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-stone-950">
                          {feature.title}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setShopPages((current) =>
                              current.map((page) =>
                                page.slug !== activeShopPage.slug
                                  ? page
                                  : {
                                      ...page,
                                      features: page.features.filter(
                                        (item) => item.id !== feature.id,
                                      ),
                                    },
                              ),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <SectionField
                          label="Title"
                          value={feature.title}
                          onChange={(value) =>
                            updateShopFeature(
                              activeShopPage.slug,
                              feature.id,
                              "title",
                              value,
                            )
                          }
                        />
                        <SectionField
                          label="Order"
                          value={feature.order}
                          type="number"
                          onChange={(value) =>
                            updateShopFeature(
                              activeShopPage.slug,
                              feature.id,
                              "order",
                              Number(value) || 0,
                            )
                          }
                        />
                        <ImageField
                          label="Image"
                          value={feature.imageUrl}
                          onChange={(value) =>
                            updateShopFeature(
                              activeShopPage.slug,
                              feature.id,
                              "imageUrl",
                              value,
                            )
                          }
                        />
                        <SectionField
                          label="Href"
                          value={feature.href}
                          onChange={(value) =>
                            updateShopFeature(
                              activeShopPage.slug,
                              feature.id,
                              "href",
                              value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Product cards"
              action={
                <button
                  type="button"
                  onClick={() =>
                    setShopPages((current) =>
                      current.map((page) =>
                        page.slug !== activeShopPage.slug
                          ? page
                          : {
                              ...page,
                              products: [
                                ...page.products,
                                {
                                  id: createId(),
                                  name: "New product",
                                  price: 0,
                                  imageUrl: "/images/sbg-kids.webp",
                                  badge: "",
                                  lowStockText: "",
                                  order: page.products.length + 1,
                                },
                              ],
                            },
                      ),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                >
                  <Plus className="size-4" />
                  Add product
                </button>
              }
            >
              <div className="grid gap-4">
                {activeShopPage.products
                  .slice()
                  .sort((first, second) => first.order - second.order)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-stone-950">
                          {product.name}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setShopPages((current) =>
                              current.map((page) =>
                                page.slug !== activeShopPage.slug
                                  ? page
                                  : {
                                      ...page,
                                      products: page.products.filter(
                                        (item) => item.id !== product.id,
                                      ),
                                    },
                              ),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <SectionField
                          label="Name"
                          value={product.name}
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "name",
                              value,
                            )
                          }
                        />
                        <SectionField
                          label="Price"
                          value={product.price}
                          type="number"
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "price",
                              Number(value) || 0,
                            )
                          }
                        />
                        <ImageField
                          label="Image"
                          value={product.imageUrl}
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "imageUrl",
                              value,
                            )
                          }
                        />
                        <SectionField
                          label="Order"
                          value={product.order}
                          type="number"
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "order",
                              Number(value) || 0,
                            )
                          }
                        />
                        <SectionField
                          label="Badge"
                          value={product.badge}
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "badge",
                              value,
                            )
                          }
                        />
                        <SectionField
                          label="Low stock text"
                          value={product.lowStockText}
                          onChange={(value) =>
                            updateShopProduct(
                              activeShopPage.slug,
                              product.id,
                              "lowStockText",
                              value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}
