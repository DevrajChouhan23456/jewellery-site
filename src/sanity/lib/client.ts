import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityConfigured } from "@/sanity/env";

export const sanityClient = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

export async function sanityFetch<QueryResult>({
  query,
  params,
}: {
  query: string;
  params?: Record<string, unknown>;
}) {
  if (!sanityClient) {
    return null;
  }

  return sanityClient.fetch<QueryResult>(query, params ?? {});
}
