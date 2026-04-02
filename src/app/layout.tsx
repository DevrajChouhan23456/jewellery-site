import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

import Providers from "./provider";
import ClientLayout from "@/components/client-layout";
import SiteShell from "@/components/site-shell";
import { Toaster } from "react-hot-toast";
import { initializeAutomation } from "@/server/automation-init";

export const metadata: Metadata = {
  title: "Tanishq | Fine Jewellery",
  description:
    "Shop from the finest collection of gold, diamond, and platinum jewellery.",
};

// Initialize automation on app start
initializeAutomation().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
