import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageCard, HomepageSectionContent } from "@/lib/storefront";

type NewArrivalsShowcaseProps = {
  section: HomepageSectionContent;
  items: HomepageCard[];
};

export default function NewArrivalsShowcase({
  section,
  items,
}: NewArrivalsShowcaseProps) {
  const itemLeft = items[0];
  const itemRightTop = items[1];
  const itemRightBottom = items[2];

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-[42px] font-serif tracking-tight text-[#333] mb-2">
            {section.title || "Tanishq Collections"}
          </h2>
          <p className="text-gray-500 text-base md:text-lg font-serif">
            {section.subtitle || section.description || "Explore our newly launched collection"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 md:h-[600px] lg:h-[700px]">
          {/* Left Large Item */}
          {itemLeft && (
            <Link
              href={itemLeft.link}
              className="relative w-full h-[400px] md:h-full rounded-[24px] overflow-hidden group block"
            >
              <Image
                src={itemLeft.image || "/images/sbg-women.jpg"}
                alt={itemLeft.title}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end items-start h-1/2">
                {itemLeft.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200 mb-3 block">
                    {itemLeft.badge}
                  </span>
                )}
                <h3 className="text-3xl lg:text-4xl text-white font-serif drop-shadow-md mb-2">
                  {itemLeft.title}
                </h3>
                {itemLeft.subtitle && (
                  <p className="text-white/90 text-sm lg:text-base font-sans line-clamp-2 max-w-sm">
                    {itemLeft.subtitle}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* Right Stacked Items */}
          <div className="flex flex-col gap-6 h-full">
            {itemRightTop && (
              <Link
                href={itemRightTop.link}
                className="relative w-full h-[250px] md:flex-1 rounded-[24px] overflow-hidden group block bg-[#f4e7e2]"
              >
                <Image
                  src={itemRightTop.image || "/images/sbg-men.webp"}
                  alt={itemRightTop.title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 max-w-[200px] text-right pointer-events-none">
                  {/* Matching the "Stunning every Ear" text overlay aesthetic */}
                  <h3 className="text-3xl text-[#5a1c22] font-serif italic drop-shadow-sm mb-1 leading-tight">
                    {itemRightTop.title}
                  </h3>
                  <p className="text-[#5a1c22]/80 text-sm font-sans flex items-center justify-end gap-1 mt-2 font-medium">
                    Explore <ArrowRight className="size-3" />
                  </p>
                </div>
              </Link>
            )}

            {/* Bottom Stacked Image */}
            <Link
              href={itemRightBottom?.link || "/shop"}
              className="relative w-full h-[250px] md:flex-1 rounded-[24px] overflow-hidden group block bg-[#822122]"
            >
              <Image
                src={itemRightBottom?.image || "/images/sbg-kids.webp"}
                alt={itemRightBottom?.title || "More Collections"}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 opacity-80 mix-blend-luminosity"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 bg-black/10 group-hover:bg-black/0 transition-colors duration-500">
                <h3 className="text-3xl text-white font-serif italic drop-shadow-sm mb-3">
                  {itemRightBottom?.title || "Discover Our Legacy"}
                </h3>
                <span className="bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 text-xs font-bold tracking-[0.15em] transition hover:bg-white/30 uppercase mt-2 group-hover:bg-white text-[#832729]">
                  Shop Now
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
