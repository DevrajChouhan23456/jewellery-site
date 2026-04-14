"use client";

import Image from "next/image";
import Link from "next/link";
import { hasCustomSiteLogo } from "@/lib/site-identity";

type LogoSectionProps = {
  logoUrl: string;
  siteName: string;
  shortName: string;
  tagline: string;
};

const LogoSection = ({
  logoUrl,
  siteName,
  shortName,
  tagline,
}: LogoSectionProps) => (
  <Link href="/" className="flex shrink-0 items-center">
    {hasCustomSiteLogo({ logoUrl }) ? (
      <div className="relative h-10 w-36 overflow-hidden">
        <Image
          src={logoUrl}
          alt={siteName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-contain object-left"
        />
      </div>
    ) : (
      <div className="flex h-12 flex-col justify-center">
        <span className="font-serif text-2xl font-bold tracking-[0.28em] text-[#832729]">
          {shortName}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">
          {tagline}
        </span>
      </div>
    )}
  </Link>
);

export default LogoSection;
