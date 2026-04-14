"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { SiteIdentity } from "@/lib/site-identity";

type SiteIdentityContextValue = {
  siteIdentity: SiteIdentity;
  setSiteIdentity: (nextSiteIdentity: SiteIdentity) => void;
};

const SiteIdentityContext = createContext<SiteIdentityContextValue | null>(null);

export function SiteIdentityProvider({
  children,
  initialSiteIdentity,
}: {
  children: ReactNode;
  initialSiteIdentity: SiteIdentity;
}) {
  const [siteIdentity, setSiteIdentity] = useState(initialSiteIdentity);

  const value = useMemo(
    () => ({
      siteIdentity,
      setSiteIdentity,
    }),
    [siteIdentity],
  );

  return (
    <SiteIdentityContext.Provider value={value}>
      {children}
    </SiteIdentityContext.Provider>
  );
}

export function useSiteIdentity() {
  const context = useContext(SiteIdentityContext);

  if (!context) {
    throw new Error("useSiteIdentity must be used within SiteIdentityProvider.");
  }

  return context;
}
