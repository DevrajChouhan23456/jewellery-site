 "use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type StorySlide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  href: string;
};

type SignatureStoriesSectionProps = {
  stories?: StorySlide[];
};

const fallbackStories: StorySlide[] = [
  {
    id: "s1",
    title: "Everyday Diamond",
    subtitle: "Refined sparkle for every day.",
    href: "/shop/diamond",
  },
  {
    id: "s2",
    title: "Classic Radiance",
    subtitle: "Modern icons with timeless shine.",
    href: "/shop/diamond",
  },
  {
    id: "s3",
    title: "Styling Diamonds",
    subtitle: "Exquisite vines diamond stories.",
    href: "/shop/diamond",
  },
  {
    id: "s4",
    title: "Fine Sparkle",
    subtitle: "Subtle elegance with statement detail.",
    href: "/shop/diamond",
  },
  {
    id: "s5",
    title: "Gift Edit",
    subtitle: "Curated gifting favourites in diamonds.",
    href: "/shop/diamond",
  },
];

const toneClasses = [
  "from-[#4eb0bd] via-[#2e7182] to-[#163a49]",
  "from-[#122d79] via-[#102765] to-[#0a1a47]",
  "from-[#7f5a4a] via-[#604335] to-[#3e2a21]",
  "from-[#112536] via-[#0f2030] to-[#0a1621]",
  "from-[#194f84] via-[#103a66] to-[#0a2947]",
];

export default function SignatureStoriesSection({ stories }: SignatureStoriesSectionProps) {
  const cards = useMemo(
    () => (stories && stories.length > 0 ? stories.slice(0, 7) : fallbackStories),
    [stories],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (cards.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [cards.length]);

  const showPrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 35) {
      if (delta > 0) showPrev();
      else showNext();
    }
    startX.current = null;
  };

  const getRelativePosition = (index: number) => {
    const total = cards.length;
    const delta = (index - activeIndex + total) % total;
    if (delta === 0) return 0;
    if (delta === 1 || delta === 2) return delta;
    if (delta === total - 1 || delta === total - 2) return delta - total;
    return null;
  };

  return (
    <section className="bg-[#f6f6f6] py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-serif text-[#2f2a25] md:text-4xl">
            Trendsetting diamond jewellery suited for every occasion
          </h2>
        </div>

        <div
          className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl bg-[#ececec] px-10"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <button
            type="button"
            aria-label="Previous stories"
            className="absolute left-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#7f7f7f] shadow-sm"
            onClick={showPrev}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next stories"
            className="absolute right-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#7f7f7f] shadow-sm"
            onClick={showNext}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="relative h-[340px] w-full max-w-[860px]">
            {cards.map((story, index) => {
              const relative = getRelativePosition(index);
              if (relative === null) return null;
              const isActive = relative === 0;
              const offsetX = relative * 112;
              const scale = isActive ? 1 : relative === 1 || relative === -1 ? 0.89 : 0.82;
              const opacity = isActive ? 1 : relative === 2 || relative === -2 ? 0.68 : 0.82;
              const zIndex = isActive ? 30 : 20 - Math.abs(relative);
              const tone = toneClasses[(index + cards.length) % toneClasses.length];

              return (
                <article
                  key={story.id}
                  className={`absolute left-1/2 top-1/2 h-[265px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-linear-to-b ${tone} text-white shadow-lg transition-all duration-500 ${
                    isActive ? "h-[340px] w-[190px]" : ""
                  }`}
                  style={{
                    transform: `translate(calc(-50% + ${offsetX}px), -50%) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  {story.imageUrl ? (
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 top-0 p-3">
                    <p className="line-clamp-1 text-xs font-semibold tracking-wide text-white/95">
                      {story.title}
                    </p>
                  </div>
                  {isActive ? (
                    <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-black/45 p-3">
                      <p className="line-clamp-1 text-sm font-medium">{story.subtitle}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {cards.map((story, index) => (
            <button
              key={story.id}
              type="button"
              aria-label={`Go to story ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-7 bg-[#832729]" : "w-2.5 bg-[#d2c8bf]"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <div className="mx-auto -mt-7 flex w-full max-w-xl items-center justify-between gap-3 rounded-full border border-[#e8d4b2] bg-white px-4 py-2 shadow-sm">
          <span className="rounded-full bg-[#f0d58f] px-3 py-1 text-[11px] font-semibold uppercase text-[#6f5330]">
            New
          </span>
          <p className="flex-1 text-center text-sm text-[#604c3a]">
            Welcome back! Continue your wedding journey with us.
          </p>
          <Link href={cards[activeIndex]?.href ?? "/shop/diamond"} className="text-[#7e2630]">
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
