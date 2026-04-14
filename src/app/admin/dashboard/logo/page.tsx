"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, LoaderCircle, RotateCcw, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { useSiteIdentity } from "@/components/site-identity-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { MagicCard } from "@/components/ui/magicui/magic-card";
import {
  DEFAULT_SITE_IDENTITY,
  hasCustomSiteLogo,
  type SiteIdentity,
} from "@/lib/site-identity";
import {
  FormCard,
  FormField,
  FormGroup,
} from "@/features/admin/products/components/FormComponents";
import { ImageGallery } from "@/features/admin/products/components/ImageGallery";

type BrandingFieldErrors = Partial<Record<keyof SiteIdentity, string>>;

function buildPreviewInitials(shortName: string) {
  return shortName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function LogoPage() {
  const router = useRouter();
  const { siteIdentity, setSiteIdentity } = useSiteIdentity();
  const [form, setForm] = useState<SiteIdentity>(siteIdentity);
  const [fieldErrors, setFieldErrors] = useState<BrandingFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    setForm(siteIdentity);
  }, [siteIdentity]);

  function updateField<K extends keyof SiteIdentity>(key: K, value: SiteIdentity[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
    setSubmitError(null);
  }

  function resetToDefaults() {
    setForm({ ...DEFAULT_SITE_IDENTITY });
    setFieldErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    startSaving(async () => {
      try {
        const response = await fetch("/api/site-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
        const data = (await response.json().catch(() => null)) as
          | {
              error?: string;
              fieldErrors?: Record<string, string[] | undefined>;
              siteIdentity?: SiteIdentity;
            }
          | null;

        if (!response.ok || !data?.siteIdentity) {
          const nextFieldErrors = Object.fromEntries(
            Object.entries(data?.fieldErrors ?? {}).map(([key, messages]) => [
              key,
              messages?.[0] ?? "Invalid value.",
            ]),
          ) as BrandingFieldErrors;

          setFieldErrors(nextFieldErrors);
          throw new Error(data?.error || "Unable to save branding changes.");
        }

        setForm(data.siteIdentity);
        setSiteIdentity(data.siteIdentity);
        toast.success("Branding updated.");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to save branding changes.";

        setSubmitError(message);
        toast.error(message);
      }
    });
  }

  const previewInitials = buildPreviewInitials(form.shortName);
  const customLogoEnabled = hasCustomSiteLogo({ logoUrl: form.logoUrl });

  return (
    <div className="space-y-6">
      <BlurFade inView delay={0.04}>
        <MagicCard
          className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_24px_80px_-42px_rgba(28,25,23,0.4)]"
          gradientFrom="#d6a75c"
          gradientTo="#7dd3fc"
          gradientColor="rgba(214,167,92,0.12)"
          gradientOpacity={0.28}
        >
          <section className="relative overflow-hidden rounded-[inherit] px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(214,167,92,0.24),transparent_58%)]" />
            <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <Badge className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900">
                  Brand Control
                </Badge>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  Change the storefront name and logo anytime from admin.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  These settings flow into the navbar, homepage brand treatment,
                  checkout experience, and page metadata so the storefront stays
                  consistent without code edits.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Header",
                    value: "Live",
                    helper: "Navbar updates immediately",
                  },
                  {
                    label: "Checkout",
                    value: "Branded",
                    helper: "Trust and summary cards reuse this identity",
                  },
                  {
                    label: "Metadata",
                    value: "Synced",
                    helper: "Titles and descriptions follow the same source",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {item.helper}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MagicCard>
      </BlurFade>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <BlurFade inView delay={0.08}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormCard
              title="Storefront identity"
              description="Edit the visible brand details that customers see across the shopping experience."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={resetToDefaults}
                  disabled={isSaving}
                >
                  <RotateCcw className="size-4" />
                  Reset defaults
                </Button>
              }
            >
              <FormGroup columns={2}>
                <FormField
                  label="Site name"
                  description="Full display name used in previews and metadata."
                  error={fieldErrors.siteName}
                >
                  <Input
                    value={form.siteName}
                    onChange={(event) => updateField("siteName", event.target.value)}
                    placeholder="Auraa Fashion Jewellery"
                    className="h-11 rounded-xl border-stone-200 bg-white px-4"
                  />
                </FormField>

                <FormField
                  label="Short name"
                  description="Compact brand mark used in text-only logos and hero callouts."
                  error={fieldErrors.shortName}
                >
                  <Input
                    value={form.shortName}
                    onChange={(event) => updateField("shortName", event.target.value)}
                    placeholder="AURAA"
                    className="h-11 rounded-xl border-stone-200 bg-white px-4"
                  />
                </FormField>
              </FormGroup>

              <FormField
                label="Tagline"
                description="Small supporting line under the logo and in brand callouts."
                error={fieldErrors.tagline}
              >
                <Input
                  value={form.tagline}
                  onChange={(event) => updateField("tagline", event.target.value)}
                  placeholder="Fashion Jewellery"
                  className="h-11 rounded-xl border-stone-200 bg-white px-4"
                />
              </FormField>
            </FormCard>

            <FormCard
              title="Logo"
              description="Upload a custom logo or keep the elegant text lockup as your fallback."
            >
              <FormField
                label="Logo image"
                description="Leave the default if you prefer the editable text mark."
                error={fieldErrors.logoUrl}
              >
                <ImageGallery
                  label="Storefront logo"
                  selectedImage={form.logoUrl}
                  onImageSelect={(url) => updateField("logoUrl", url)}
                />
              </FormField>

              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-4 py-4 text-sm text-stone-600">
                Clear the image URL or press reset if you want to go back to the
                text-based logo using the short name and tagline.
              </div>
            </FormCard>

            <FormCard
              title="Save changes"
              description="Publish the new identity across the storefront and admin surfaces."
            >
              {submitError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  className="rounded-full bg-stone-950 px-5 text-white hover:bg-stone-800"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save branding
                    </>
                  )}
                </Button>
                <p className="text-sm text-stone-500">
                  Updates appear in the header, homepage, checkout, and metadata.
                </p>
              </div>
            </FormCard>
          </form>
        </BlurFade>

        <BlurFade inView delay={0.12}>
          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <FormCard
              title="Live preview"
              description="A quick look at how the brand identity presents without leaving admin."
            >
              <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,#fffdf9_0%,#f7f2ea_55%,#edf7fb_100%)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-sm">
                    {customLogoEnabled ? (
                      <div className="relative h-9 w-16 overflow-hidden">
                        <Image
                          src={form.logoUrl}
                          alt={form.siteName}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <span className="font-serif text-lg font-semibold tracking-[0.24em] text-[#832729]">
                        {previewInitials || "BR"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{form.siteName}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                      {form.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Storefront feel
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                    {form.shortName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Clean, premium branding carried into customer-facing pages and
                    admin touchpoints.
                  </p>
                </div>
              </div>
            </FormCard>

            <FormCard
              title="What updates"
              description="A quick checklist so you know where the new brand settings show up."
            >
              <div className="space-y-3">
                {[
                  "Navbar logo and text lockup",
                  "Homepage hero brand treatment",
                  "Checkout trust and summary panels",
                  "Admin topbar brand label",
                  "Site title and description metadata",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50/80 px-4 py-3"
                  >
                    <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCheck className="size-3.5" />
                    </div>
                    <p className="text-sm text-stone-700">{item}</p>
                  </div>
                ))}
              </div>
            </FormCard>

            <FormCard
              title="Quick guidance"
              description="A few brand-friendly defaults that keep the UI feeling polished."
            >
              <div className="space-y-3">
                {[
                  "Use the full site name for search and metadata clarity.",
                  "Keep the short name compact so it works as a text logo fallback.",
                  "Upload a logo with transparent background for the cleanest header result.",
                ].map((tip) => (
                  <div
                    key={tip}
                    className="rounded-[1.25rem] border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600"
                  >
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900">
                      <Sparkles className="size-3.5" />
                      Tip
                    </div>
                    {tip}
                  </div>
                ))}
              </div>
            </FormCard>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
