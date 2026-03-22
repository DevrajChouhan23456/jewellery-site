import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerLoginPage() {
  return (
    <main className="luxury-shell luxury-section">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="luxury-panel p-8 luxury-shadow sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-amber-900">
            <Sparkles className="size-3.5" />
            Customer Login
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Sign in to manage your jewellery account.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
            This is the customer account entry point for orders, saved products,
            wishlist items, and delivery details. The backend user auth flow can
            now be built here without mixing with admin access.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5">
              <Mail className="size-5 text-[var(--luxury-gold-deep)]" />
              <p className="mt-3 text-sm font-medium text-stone-900">
                Email-first customer sign-in
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5">
              <LockKeyhole className="size-5 text-[var(--luxury-gold-deep)]" />
              <p className="mt-3 text-sm font-medium text-stone-900">
                Separate from the private admin CMS
              </p>
            </div>
          </div>
        </section>

        <Card className="rounded-[2rem] border border-white/70 bg-white/75 luxury-shadow">
          <CardHeader className="border-b border-stone-200 p-7">
            <CardTitle className="text-2xl font-semibold tracking-tight text-stone-950">
              Customer Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-7">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 rounded-xl border-stone-200 bg-white/80"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 rounded-xl border-stone-200 bg-white/80"
              />
            </div>
            <Button
              type="button"
              className="h-12 w-full rounded-full bg-stone-950 text-white hover:bg-stone-800"
            >
              Sign In
            </Button>
            <p className="text-sm leading-7 text-[var(--luxury-muted)]">
              This page is scaffolded and ready for a dedicated customer auth flow.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-stone-700"
            >
              Explore the account area
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
