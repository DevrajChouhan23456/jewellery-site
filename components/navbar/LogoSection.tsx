"use client";

import Image from "next/image";
import Link from "next/link";

type LogoSectionProps = {
  logoUrl: string;
};

const LogoSection = ({ logoUrl }: LogoSectionProps) => (
  <Link href="/" className="flex shrink-0 items-center">
    {logoUrl ? (
      <div className="relative h-10 w-36 overflow-hidden">
        <Image
          src={logoUrl}
          alt="Tanishq"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-contain object-left"
        />
      </div>
    ) : (
      <div className="relative h-12 w-32 flex items-center justify-center">
        <span className="text-[#832729] font-serif text-2xl tracking-wider font-bold">
          TANISHQ
        </span>
      </div>
    )}
  </Link>
);

export default LogoSection;
