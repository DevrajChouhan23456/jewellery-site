import Image from "next/image";
import Link from "next/link";
import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

const accentPresets = [
  "from-[#d8e8e6] to-[#b6d0cd]", // Soft teal/blue
  "from-[#f3e5d0] to-[#e8d1b3]", // Soft beige/gold
  "from-[#eadecd] to-[#d6c3af]", // Sand
  "from-[#f5e6e6] to-[#eed3d3]", // Soft rose
];

type CategoryGridProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function CategoryGrid({ section, items }: CategoryGridProps) {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl font-serif tracking-tight text-gray-900 sm:text-4xl md:text-[42px] mb-2">
            {section.title || "Find Your Perfect Match"}
          </h2>
          <p className="text-base md:text-lg text-gray-500 font-serif">
            {section.subtitle || "Shop by Categories"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
          {items.map((item, index) => (
            <Link key={item.id} href={item.link} className="group block flex flex-col items-center">
              <div className="w-full overflow-hidden rounded-[14px]">
                {item.image ? (
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden mb-4">
                     {/* Soft background gradient beneath the image */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        accentPresets[index % accentPresets.length]
                      } opacity-40`}
                    />
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-multiply"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] sm:aspect-square mb-4 flex flex-col items-center justify-center p-6 text-center bg-white border border-gray-100 shadow-sm rounded-[14px] transition-shadow duration-300 group-hover:shadow-md">
                    <p className="text-5xl md:text-6xl font-serif text-[#832729] mb-3">
                      {item.badge ?? "10+"}
                    </p>
                    <p className="text-sm md:text-base font-serif text-gray-800 max-w-[140px]">
                      {item.subtitle || "Categories to chose from"}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.15em] text-[#333]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
