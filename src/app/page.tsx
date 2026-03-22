import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import HeroSection from "@/components/slider";
import ShopByGender from "@/components/ShopByGender";
import CategoryGrid from "@/components/CategoryGrid";
import CuratedSection from "@/components/curtatedSection";
import NewArrivalsShowcase from "@/components/NewArrivalsShowcase";
import { getHomepageContent } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const servicePillars = [
  {
    title: "Certified Craft",
    description: "Every piece is presented with care, quality, and confidence.",
    icon: ShieldCheck,
  },
  {
    title: "Store Guidance",
    description:
      "Book a consultation and discover styles with personal assistance.",
    icon: Store,
  },
  {
    title: "Secure Delivery",
    description:
      "From packaging to doorstep, every order is handled with precision.",
    icon: Truck,
  },
];

export default async function Home() {
  const homepageContent = await getHomepageContent();

  return (
    <main>
      <HeroSection slides={homepageContent.heroSlides} />
      <CategoryGrid
        section={homepageContent.sections.category}
        items={homepageContent.categories}
      />
      <CuratedSection
        section={homepageContent.sections.trending}
        items={homepageContent.trending}
      />
      <NewArrivalsShowcase
        section={homepageContent.sections.arrival}
        items={homepageContent.arrivals}
      />
      <ShopByGender
        section={homepageContent.sections.gender}
        items={homepageContent.gender}
      />

      <section className="luxury-section">
        <div className="luxury-shell">
          <div className="luxury-panel flex flex-col gap-8 p-8 luxury-shadow sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--luxury-gold-deep)]">
                Signature Styling
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Jewellery designed to feel personal, modern, and memorable.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--luxury-muted)]">
                Explore refined silhouettes, luminous stones, and timeless
                detailing curated for celebrations, gifting, and everyday
                elegance.
              </p>
            </div>
            <Link
              href="/shop/jewellery"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Shop the Collection
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="luxury-section"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255, 250, 244, 0) 0%, rgba(244, 236, 226, 0.82) 100%)",
        }}
      >
        <div className="luxury-shell">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--luxury-gold-deep)]">
              Why Clients Choose Us
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              A luxury experience built on trust, care, and presentation.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {servicePillars.map((item) => (
              <div
                key={item.title}
                className="luxury-panel rounded-[1.75rem] p-7"
                style={{ boxShadow: "0 25px 70px -50px rgba(120, 83, 33, 0.55)" }}
              >
                <item.icon className="size-5 text-[var(--luxury-gold-deep)]" />
                <h3 className="mt-4 text-lg font-semibold text-stone-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section pt-0">
        <div className="luxury-shell">
          <div
            className="rounded-[2rem] border border-stone-200 bg-stone-950 px-8 py-10 text-stone-100 sm:px-10"
            style={{ boxShadow: "0 30px 90px -55px rgba(28, 25, 23, 0.92)" }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  New Season Edit
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Build your next signature look with pieces that layer beautifully.
                </h2>
              </div>
              <Link
                href="/shop/earrings"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
              >
                Explore Earrings
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
