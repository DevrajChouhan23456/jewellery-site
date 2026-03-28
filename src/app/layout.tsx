import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

import Providers from "./provider";
import SiteShell from "@/components/site-shell";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Tanishq | Fine Jewellery",
  description:
    "Shop from the finest collection of gold, diamond, and platinum jewellery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={
          {
            "--font-geist-sans": "system-ui, sans-serif",
            "--font-geist-mono": "ui-monospace, SFMono-Regular, monospace",
          } as CSSProperties
        }
      >
        <Providers>
          <SiteShell>{children}</SiteShell>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
