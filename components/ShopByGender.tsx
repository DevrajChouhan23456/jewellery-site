import Image from "next/image";
import Link from "next/link";

import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

type ShopByGenderProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function ShopByGender({
  section,
  items,
}: ShopByGenderProps) {
  return (
    <section
      className="luxury-section"
      style={{
        backgroundImage: "linear-gradient(180deg, #fffaf4 0%, #f5ede4 100%)",
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

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 luxury-shadow"
            >
              <div className="relative aspect-[0.9] overflow-hidden">
                <Image
                  src={item.image ?? "/images/sbg-women.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                {item.badge ? (
                  <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                    {item.badge}
                  </div>
                ) : null}
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-stone-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
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
