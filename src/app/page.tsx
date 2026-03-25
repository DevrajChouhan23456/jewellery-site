import Link from "next/link";
import {
  ArrowRight,
  Gem,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

import HeroSection from "@/components/slider";
import SignatureStoriesSection from "@/components/SignatureStoriesSection";
import ShopByGender from "@/components/ShopByGender";
import CategoryGrid from "@/components/CategoryGrid";
import CuratedSection from "@/components/curtatedSection";
import NewArrivalsShowcase from "@/components/NewArrivalsShowcase";
import { getHomepageContent } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tanishq | Best Jewellery Online",
  description: "Explore the latest collections of fine jewellery at Tanishq.",
};

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

const reassuranceHighlights = [
  {
    title: "Try at Home, Fast",
    description: "Priority samples delivered in 24–72 hours with easy returns.",
    icon: Truck,
  },
  {
    title: "Lifetime Care",
    description: "Complimentary cleaning, tightening, and resizing on every piece.",
    icon: ShieldCheck,
  },
  {
    title: "Certified Stones",
    description: "GIA / IGI grading and transparent gold purity on every order.",
    icon: Gem,
  },
  {
    title: "Concierge Updates",
    description: "Chat updates from purchase to delivery, including gift timing.",
    icon: MessageCircle,
  },
];

const conciergeActions = [
  {
    title: "Book a Styling Call",
    description: "Share your event, budget, and vibe; receive a tailored cart in 24 hours.",
    href: "/contact",
    icon: PhoneCall,
  },
  {
    title: "Visit the Studio",
    description: "See metal finishes and stones in person. Private appointments daily.",
    href: "/about",
    icon: MapPin,
  },
  {
    title: "Gift Concierge",
    description: "Handwritten notes, discreet delivery windows, luxe wrapping, and tracking.",
    href: "/contact",
    icon: Sparkles,
  },
];

const layeringIdeas = [
  "Layer a slim herringbone with a sculpted pendant for contrast.",
  "Mix metals around one hero ring to add depth without bulk.",
  "Pair quiet diamond studs with a structured ear cuff for edge.",
];

export default async function Home() {
  const homepageContent = await getHomepageContent();

  return (
    <main className="bg-[#faf9f6]">
      <HeroSection slides={homepageContent.heroSlides} />
      <SignatureStoriesSection
        stories={homepageContent.heroSlides.map((slide) => ({
          id: slide.id,
          title: slide.title ?? "Signature Story",
          subtitle: slide.subtitle ?? "Explore featured jewellery stories.",
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
            {servicePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-3xl border border-[#efe7dc] bg-[#fdf9f4] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
              >
                <div className="inline-flex rounded-full border border-[#e7d7c4] bg-white p-3 text-[#8a6b46]">
                  <pillar.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-serif text-[#2f2a25]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#6a6258]">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#faf6ef] py-12 sm:py-14">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {reassuranceHighlights.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-2xl border border-[#eadfce] bg-white p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
              >
                <div className="inline-flex rounded-full bg-[#f7efe3] p-2.5 text-[#8a6b46]">
                  <highlight.icon className="size-4.5" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-[#2f2a25]">
                  {highlight.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[#6a6258]">
                  {highlight.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b46]">
              Concierge Services
            </p>
            <h2 className="mt-3 text-3xl font-serif text-[#2f2a25] sm:text-4xl">
              Personalized guidance for every jewellery moment
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {conciergeActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-3xl border border-[#efe7dc] bg-[#fdf9f4] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
              >
                <div className="inline-flex rounded-full border border-[#e7d7c4] bg-white p-3 text-[#8a6b46]">
                  <action.icon className="size-5" />
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
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#fbf7f0] py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b46]">
              Styling Journal
            </p>
            <h2 className="mt-3 text-3xl font-serif text-[#2f2a25] sm:text-4xl">
              Layer with balance, shine with intention
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {layeringIdeas.map((idea, index) => (
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
