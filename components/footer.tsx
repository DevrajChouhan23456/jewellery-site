import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const shopLinks = [
  { label: "Rings", href: "/shop/rings" },
  { label: "Earrings", href: "/shop/earrings" },
  { label: "Diamond", href: "/shop/diamond" },
  { label: "Gold", href: "/shop/gold" },
];

const serviceLinks = [
  { label: "Book an Appointment", href: "/shop/jewellery" },
  { label: "Gift Guide", href: "/shop/gifting" },
  { label: "Client Support", href: "/shop/jewellery" },
  { label: "Care Tips", href: "/shop/thejoydressing" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t border-stone-200 text-stone-800"
      style={{
        backgroundImage: "linear-gradient(180deg, #fcfaf7 0%, #f5efe8 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div
            className="rounded-[2rem] border border-white/70 bg-white/70 p-8 backdrop-blur"
            style={{ boxShadow: "0 25px 80px -45px rgba(120, 83, 33, 0.55)" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-amber-900">
              <Sparkles className="size-3.5" />
              Fine Jewellery
            </div>
            <h2 className="mt-5 max-w-md text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Crafted to mark everyday elegance and once-in-a-lifetime moments.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
              Discover timeless gold, radiant diamonds, and thoughtful gifting pieces designed with modern Indian luxury in mind.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/shop/jewellery"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Explore Collections
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/shop/gifting"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Find a Gift
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-t border-stone-200 pt-6 text-sm text-stone-600 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-amber-700" />
                Certified quality
              </div>
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-amber-700" />
                Secure delivery
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-700" />
                Store assistance
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-7 backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                Shop
              </h3>
              <div className="mt-5 grid gap-3">
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-stone-700 transition hover:text-stone-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-7 backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                Services
              </h3>
              <div className="mt-5 grid gap-3">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-stone-700 transition hover:text-stone-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div
              className="rounded-[1.75rem] border border-stone-200/80 bg-stone-900 p-7 text-stone-100"
              style={{ boxShadow: "0 25px 70px -40px rgba(28, 25, 23, 0.8)" }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-300">
                Stay Connected
              </h3>
              <p className="mt-5 text-sm leading-7 text-stone-300">
                Receive festive launches, bridal edits, and gifting inspirations with a quiet luxury touch.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-stone-200">
                <div className="font-medium text-white">Visit or call us</div>
                <div className="mt-3 flex items-center gap-2">
                  <Phone className="size-4" />
                  +91 1800 000 000
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="size-4" />
                  Jewellery Lounge, New Delhi
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-100 transition hover:bg-white/10"
                    aria-label={link.label}
                  >
                    <link.icon className="size-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-stone-300/70 pt-6 text-sm text-stone-600 md:flex-row md:items-center md:justify-between">
          <p>(C) 2026 Tanishq Jewellery. Designed for modern heirlooms.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop/jewellery" className="transition hover:text-stone-900">
              Privacy
            </Link>
            <Link href="/shop/jewellery" className="transition hover:text-stone-900">
              Terms
            </Link>
            <Link href="/shop/jewellery" className="transition hover:text-stone-900">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
