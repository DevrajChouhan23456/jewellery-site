import Link from "next/link";
import {
  ArrowRight,
  Gem,
  type LucideIcon,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

import CategoryGrid from "@/components/CategoryGrid";
import CuratedSection from "@/components/curtatedSection";
import NewArrivalsShowcase from "@/components/NewArrivalsShowcase";
import ShopByGender from "@/components/ShopByGender";
import SignatureStoriesSection from "@/components/SignatureStoriesSection";
import HeroSection from "@/components/slider";
import type { HomePageIconKey } from "@/lib/storefront-homepage-defaults";
import { getHomepageContent } from "@/lib/storefront";
import { getSiteIdentity } from "@/server/services/site-identity";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const siteIdentity = await getSiteIdentity();

  return {
    title: `${siteIdentity.shortName} | Artificial Jewellery Online`,
    description: `Explore artificial jewellery, gifting picks, and occasion-ready style edits at ${siteIdentity.siteName}.`,
  };
}

const iconMap: Record<HomePageIconKey, LucideIcon> = {
  shieldCheck: ShieldCheck,
  store: Store,
  truck: Truck,
  gem: Gem,
  messageCircle: MessageCircle,
  phoneCall: PhoneCall,
  mapPin: MapPin,
  sparkles: Sparkles,
};

export default async function Home() {
  const homepageContent = await getHomepageContent();

  return (
    <main className="bg-[#faf9f6]">
      <HeroSection slides={homepageContent.heroSlides} />
      <SignatureStoriesSection
        stories={homepageContent.heroSlides.map((slide) => ({
          id: slide.id,
          title: slide.title ?? "Signature Story",
          subtitle:
            slide.subtitle ?? "Explore featured artificial jewellery edits.",
          imageUrl: slide.imageUrl,
          href: slide.ctaHref ?? "/shop/jewellery",
        }))}
      />
      <CategoryGrid
        section={homepageContent.sections.category}
        items={homepageContent.categories}
      />
      <ShopByGender
        section={homepageContent.sections.gender}
        items={homepageContent.gender}
      />
      <CuratedSection
        section={homepageContent.sections.trending}
        items={homepageContent.trending}
      />
      <NewArrivalsShowcase
        section={homepageContent.sections.arrival}
        items={homepageContent.arrivals}
      />
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {homepageContent.servicePillars.map((pillar) => {
              const Icon = iconMap[pillar.icon];

              return (
                <article
                  key={pillar.title}
                  className="rounded-3xl border border-[#efe7dc] bg-[#fdf9f4] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                >
                  <div className="inline-flex rounded-full border border-[#e7d7c4] bg-white p-3 text-[#8a6b46]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-serif text-[#2f2a25]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6a6258]">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-[#faf6ef] py-12 sm:py-14">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {homepageContent.reassuranceHighlights.map((highlight) => {
              const Icon = iconMap[highlight.icon];

              return (
                <article
                  key={highlight.title}
                  className="rounded-2xl border border-[#eadfce] bg-white p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                >
                  <div className="inline-flex rounded-full bg-[#f7efe3] p-2.5 text-[#8a6b46]">
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-[#2f2a25]">
                    {highlight.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#6a6258]">
                    {highlight.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b46]">
              {homepageContent.conciergeEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-serif text-[#2f2a25] sm:text-4xl">
              {homepageContent.conciergeTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {homepageContent.conciergeActions.map((action) => {
              const Icon = iconMap[action.icon];

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-3xl border border-[#efe7dc] bg-[#fdf9f4] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                >
                  <div className="inline-flex rounded-full border border-[#e7d7c4] bg-white p-3 text-[#8a6b46]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-serif text-[#2f2a25]">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6a6258]">
                    {action.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#832729]">
                    Connect now
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-[#fbf7f0] py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b46]">
              {homepageContent.stylingJournalEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-serif text-[#2f2a25] sm:text-4xl">
              {homepageContent.stylingJournalTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {homepageContent.stylingTips.map((idea, index) => (
              <article
                key={idea}
                className="rounded-2xl border border-[#eadfce] bg-white p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6b46]">
                  Tip {index + 1}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#4f473f]">{idea}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
