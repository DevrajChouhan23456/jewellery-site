import Image from "next/image";
import Link from "next/link";

import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

const tonePresets = [
  "from-[#20311d]/70 to-transparent",
  "from-[#6f1d28]/55 to-transparent",
  "from-[#9c6d66]/35 to-transparent",
];

type CuratedSectionProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function CuratedSection({
  section,
  items,
}: CuratedSectionProps) {
  return (
    <section
      className="luxury-section"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 241, 233, 0.85) 100%)",
      }}
    >
      <div className="luxury-shell">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            {section.title}
          </h2>
          {section.subtitle ? (
            <p className="mt-3 text-lg text-[var(--luxury-muted)]">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={item.link}
              className="group relative overflow-hidden rounded-[2rem] luxury-shadow"
            >
              <div className="relative aspect-[0.86] overflow-hidden rounded-[2rem]">
                <Image
                  src={item.image ?? "/images/sbg-women.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    tonePresets[index % tonePresets.length]
                  } via-transparent to-transparent`}
                />
                {item.badge ? (
                  <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                    {item.badge}
                  </div>
                ) : null}
              </div>
              <div className="bg-white px-6 py-5 text-center">
                <h3
                  className="text-2xl text-stone-950"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--luxury-muted)]">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
