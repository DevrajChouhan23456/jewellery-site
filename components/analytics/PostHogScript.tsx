/**
 * PostHog Analytics Script
 * Add this to your layout.tsx head section to enable PostHog tracking
 * without npm dependency
 * 
 * Usage in layout.tsx:
 * import { PostHogScript } from "@/components/analytics/PostHogScript";
 * 
 * Then add <PostHogScript /> in the <head> section
 */

export function PostHogScript() {
  // The actual script HTML should be rendered via dangerouslySetInnerHTML
  // This component prepares the script for insertion
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  
  if (!posthogKey) {
    return null;
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r,a=[];function c(t){if("undefined"!=typeof window){var e=window.document.createElement("script");e.src=t,e.type="text/javascript",e.async=!0,e.defer=!0,window.document.getElementsByTagName("head")[0].appendChild(e)}}function s(t){return"string"==typeof t?t:"object"==typeof t&&null!=t?null:"undefined"==typeof t?"undefined":(t.toString(),t)}window.posthog=window.posthog||a,a.push=function(){arguments.length;var t=arguments;window.posthog._q=window.posthog._q||[],window.posthog._q.push(function(){window.posthog.apply(window.posthog,t)})},a.identify=function(){window.posthog._q=window.posthog._q||[],window.posthog._q.push(function(){window.posthog.identify.apply(window.posthog,arguments)})},a.capture=function(){window.posthog._q=window.posthog._q||[],window.posthog._q.push(function(){window.posthog.capture.apply(window.posthog,arguments)})};
            posthog.init("${posthogKey}",{api_host:"https://app.posthog.com",autocapture:true,persistence:"localStorage",capture_pageview:true});
          `,
        }}
      />
    </>
  );
}
