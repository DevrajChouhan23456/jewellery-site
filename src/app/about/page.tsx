import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, ShieldCheck, Sparkles } from "lucide-react";

const brandValues = [
  {
    title: "Craft With Character",
    description:
      "We focus on expressive silhouettes, refined detailing, and pieces that feel personal from first wear.",
    icon: Gem,
  },
  {
    title: "Trust-Led Experience",
    description:
      "From curation to delivery, the storefront is designed to feel polished, reassuring, and clear.",
    icon: ShieldCheck,
  },
  {
    title: "Modern Styling",
    description:
      "Our edits balance festive richness, gifting warmth, and easy everyday elegance.",
    icon: Sparkles,
  },
];

export default function AboutPage() {
  return (
    <main
      className="pb-24"
      style={{
        backgroundImage: "linear-gradient(180deg, #fffaf4 0%, #ffffff 46%, #f6ede3 100%)",
      }}
    >
      <section className="px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="luxury-shell">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--luxury-gold-deep)]">
                About The Brand
              </p>
              <h1
                className="mt-5 max-w-3xl text-4xl leading-tight text-stone-950 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Jewellery shaped around modern rituals, gifting, and everyday glow.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)] sm:text-lg">
                We built this storefront to feel like a thoughtful boutique:
                polished visuals, expressive categories, and collection pages that
                guide each customer toward a signature piece.
              </p>
              <Link
                href="/shop/jewellery"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Explore The Collections
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 p-3 luxury-shadow backdrop-blur">
              <div className="relative aspect-[0.95] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/sbg-women.jpg"
                  alt="Jewellery styling"
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(20, 17, 15, 0.02) 0%, rgba(20, 17, 15, 0.28) 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section pt-0">
        <div className="luxury-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {brandValues.map((value) => (
              <div
                key={value.title}
                className="luxury-panel p-7 luxury-shadow"
              >
                <value.icon className="size-5 text-[var(--luxury-gold-deep)]" />
                <h2 className="mt-4 text-xl font-semibold text-stone-950">
                  {value.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
