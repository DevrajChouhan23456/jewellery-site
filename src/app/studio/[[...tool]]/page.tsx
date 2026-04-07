import type { Metadata } from "next";

import { requireAdminPageAccess } from "@/server/auth/admin";
import { dataset, projectId, sanityConfigured } from "@/sanity/env";

import { StudioClient } from "./studio-client";

export const metadata: Metadata = {
  title: "Sanity Studio | Jewellery",
  description: "Manage storefront content in Sanity Studio.",
};

export default async function StudioPage() {
  await requireAdminPageAccess("/studio");

  if (!sanityConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 text-stone-900">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
          Sanity Setup
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Add your Sanity project details to enable the Studio
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-600">
          This route is ready, but the app still needs your Sanity project
          credentials. Add the environment variables below, restart the dev
          server, and then revisit <code>/studio</code>.
        </p>
        <pre className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-stone-950 px-6 py-5 text-sm text-stone-100">
{`NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

Current project id: ${projectId || "(missing)"}
Current dataset: ${dataset || "(missing)"}`}
        </pre>
      </main>
    );
  }

  return <StudioClient />;
}
