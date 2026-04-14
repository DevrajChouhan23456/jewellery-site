import type { Metadata } from "next";
import "./globals.css";

import Providers from "./provider";
import ClientLayout from "@/components/client-layout";
import SiteShell from "@/components/site-shell";
import { initializeAutomation } from "@/server/automation-init";
import { getSiteIdentity } from "@/server/services/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  const siteIdentity = await getSiteIdentity();

  return {
    title: `${siteIdentity.shortName} | ${siteIdentity.tagline}`,
    description: `Shop artificial jewellery, gifting picks, and occasion-ready styles at ${siteIdentity.siteName}.`,
  };
}

// Initialize automation on app start
initializeAutomation().catch(console.error);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteIdentity = await getSiteIdentity();

  return (
    <html lang="en">
      <body className="antialiased">
        <Providers initialSiteIdentity={siteIdentity}>
          <SiteShell>
            <ClientLayout>
              {children}
            </ClientLayout>
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
