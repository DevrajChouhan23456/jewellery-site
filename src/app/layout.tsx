import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "./provider";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/site-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tanishq | Fine Jewellery",
  description: "Shop from the finest collection of gold, diamond, and platinum jewellery for every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
