import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerLoginPage() {
  return (
    <main className="min-h-[calc(100vh-9rem)] bg-linear-to-b from-[#f8efe5] to-[#fdfaf6] px-4 py-10">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-[1.25rem] border border-[#e8d8c3] bg-[#fbf0e3] p-3 shadow-[0_38px_80px_-54px_rgba(36,24,20,0.62)] sm:p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-[#eadcc9] bg-linear-to-b from-[#f8ecd9] to-[#f1e0c3] p-6 text-[#5f4730]">
            <div className="mx-auto flex max-w-[340px] flex-col items-center text-center">
              <div className="mt-1 rounded-full border border-[#ecd7b3] bg-[#f6e8d0] p-6">
                <Sparkles className="size-10 text-[#8a2e35]" />
              </div>
              <div className="mt-5 rounded-full border border-[#e7cfac] bg-[#f8ead2] px-8 py-2 text-sm font-semibold text-[#735132]">
                Personalized Curations
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#5a3e25]">
                Welcome
              </h1>
              <p className="mt-2 text-base text-[#6b5036]">
                Explore curated collections based on your style and occasions.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-[#e8ded0] bg-white p-6 shadow-sm">
            <Link
              href="/"
              className="absolute right-5 top-5 grid size-7 place-items-center rounded-full text-[#846a54] transition hover:bg-[#f6f1eb]"
            >
              <X className="size-4" />
            </Link>
            <h2 className="pr-8 text-[30px] font-semibold leading-none text-[#3a2b1f]">
              Welcome to Tanishq!
            </h2>
            <p className="mt-2 text-sm text-[#6f5d4d]">
              Login/Signup to get exclusive Tanishq privileges
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-full border border-[#eadfce] bg-white p-1.5">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-[#e9dece] px-3 py-2 text-sm text-[#614b38]"
              >
                🇮🇳
                <ChevronDown className="size-3" />
              </button>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                className="h-10 border-0 bg-transparent text-sm shadow-none focus-visible:border-0 focus-visible:ring-0"
              />
              <Button
                type="button"
                className="h-10 rounded-full bg-[#8b1f2d] px-6 text-xs font-semibold tracking-wide text-white hover:bg-[#741927]"
              >
                Request OTP
              </Button>
            </div>

            <div className="mt-6 grid gap-3">
              <Input
                type="text"
                placeholder="Enter full name"
                className="h-11 rounded-lg border-[#e8dece]"
              />
              <Input
                type="email"
                placeholder="Enter Email ID"
                className="h-11 rounded-lg border-[#e8dece]"
              />
              <Button
                type="button"
                className="h-11 rounded-lg bg-[#8b1f2d] text-sm font-semibold text-white hover:bg-[#741927]"
              >
                Continue
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-[#7a6655]">
              By continuing, I agree to{" "}
              <Link href="/account" className="underline underline-offset-4">
                Terms of Use
              </Link>{" "}
              &{" "}
              <Link href="/account" className="underline underline-offset-4">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-xl rounded-full border border-[#e8d4b2] bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="rounded-full bg-[#f0d58f] px-3 py-1 text-[11px] font-semibold uppercase text-[#6f5330]">
            New
          </span>
          <p className="flex-1 text-center text-[#604c3a]">
            Welcome back! Continue your wedding journey with us.
          </p>
          <ArrowRight className="size-4 text-[#7e2630]" />
        </div>
      </div>
    </main>
  );
}
