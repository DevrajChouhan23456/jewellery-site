import Image from "next/image";
import Link from "next/link";

import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

const accentPresets = [
  "from-rose-100 via-sky-50 to-cyan-100",
  "from-amber-100 via-stone-50 to-yellow-50",
  "from-cyan-200 via-sky-100 to-blue-100",
  "from-yellow-50 via-amber-50 to-stone-100",
  "from-rose-50 via-orange-50 to-white",
  "from-stone-50 via-amber-100 to-orange-100",
  "from-cyan-200 via-blue-100 to-slate-100",
  "from-white via-stone-50 to-amber-50",
];

type CategoryGridProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function CategoryGrid({ section, items }: CategoryGridProps) {
  return (
    <section className="luxury-section pt-0">
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

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <Link key={item.id} href={item.link} className="group block">
              <div className="overflow-hidden rounded-[2rem]">
                {item.image ? (
                  <div className="relative aspect-[1/1.1] overflow-hidden rounded-[2rem]">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        accentPresets[index % accentPresets.length]
                      }`}
                    />
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.18) 100%)",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`flex aspect-[1/1.1] items-center justify-center rounded-[2rem] border border-stone-200 bg-gradient-to-br ${
                      accentPresets[index % accentPresets.length]
                    } p-8 text-center`}
                  >
                    <div>
                      <p className="text-6xl font-semibold tracking-tight text-[var(--luxury-gold-deep)]">
                        {item.badge ?? "10+"}
                      </p>
                      <p className="mt-4 text-xl text-stone-700">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 text-center">
                <h3
                  className="text-2xl font-medium uppercase tracking-wide text-stone-950"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {item.title}
                </h3>
                {item.image && item.subtitle ? (
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-[var(--luxury-muted)]">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
