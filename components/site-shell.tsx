"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[var(--luxury-ivory)]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
