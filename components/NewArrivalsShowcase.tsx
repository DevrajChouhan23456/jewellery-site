import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem } from "lucide-react";

import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

type NewArrivalsShowcaseProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function NewArrivalsShowcase({
  section,
  items,
}: NewArrivalsShowcaseProps) {
  return (
    <section className="luxury-section">
      <div className="luxury-shell">
        <div
          className="overflow-hidden rounded-[2.5rem] luxury-shadow"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #b1a793 0%, #c6b79f 28%, #a99673 58%, #b89f71 100%)",
          }}
        >
          <div className="grid gap-8 px-7 py-10 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
                <Gem className="size-4" />
                {section.eyebrow || "500+ New Items"}
              </div>
              <h2
                className="mt-6 text-5xl leading-none sm:text-6xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {section.title}
              </h2>
              <p className="mt-5 max-w-xl text-xl leading-9 text-white/95">
                {section.description}
              </p>
              <Link
                href={section.ctaHref || "/shop/jewellery"}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
              >
                {section.ctaLabel || "Explore Latest Launches"}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="relative min-h-[260px]">
              <div
                className="absolute inset-0 rounded-[2rem]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.26), transparent 24%), radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.16), transparent 24%)",
                }}
              />
              <div className="relative ml-auto flex max-w-xl justify-end">
                <div className="relative aspect-[1.2] w-full max-w-[30rem] overflow-hidden rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 28%), linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.02))",
                    }}
                  />
                  <div className="absolute left-8 top-10 h-40 w-40 rounded-full border border-white/20 bg-white/10 blur-[1px]" />
                  <div className="absolute right-8 bottom-12 h-28 w-28 rounded-full border border-white/20 bg-white/8 blur-[1px]" />
                  <div
                    className="absolute left-[18%] top-[14%] h-56 w-56 rounded-full border-[18px] border-[#b18437]"
                    style={{ boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)" }}
                  />
                  <div
                    className="absolute right-[8%] top-[40%] h-40 w-40 rounded-full border-[14px] border-[#d0a958]"
                    style={{ boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)" }}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                      style={{ boxShadow: "0 0 0 8px rgba(255, 255, 255, 0.18)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-7 px-7 pb-10 sm:px-10 lg:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="group relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/8 p-3 backdrop-blur"
              >
                <div className="relative aspect-[1.7] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={item.image ?? "/images/sbg-women.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    {item.badge ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
                        {item.badge}
                      </p>
                    ) : null}
                    <h3
                      className="mt-2 text-2xl text-white"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
