/**
 * PostHog Analytics Setup
 * 
 * To integrate PostHog:
 * 1. Install: npm install posthog-js
 * 2. Add to package.json dependencies
 * 3. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local
 * 4. Add this to app provider component
 * 
 * Example environment variables:
 * NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
 * NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
 */

"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export { posthogEvents } from "@/lib/posthog-events";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // PostHog initialization
    const initPostHog = async () => {
      try {
        // Check if PostHog already exists (from CDN or other source)
        if (typeof window !== "undefined" && (window as any).posthog) {
          const posthog = (window as any).posthog;
          
          // Track page views
          posthog.pageView();
          
          // Custom events
          posthog.capture("dashboard_visited", {
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("PostHog initialization error:", error);
      }
    };

    initPostHog();
  }, []);

  return children;
}
