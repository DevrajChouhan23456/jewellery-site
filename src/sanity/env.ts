export const apiVersion = "2026-04-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const studioPath = "/studio";
export const sanityConfigured = Boolean(projectId && dataset);
