import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function DashboardNoticePage() {
  return (
    <FeaturePlaceholder
      title="Notice management is not configured in this storefront"
      description="These routes came from an older school-site dashboard and no longer match the current Prisma schema. The page is kept as a safe placeholder so the app builds cleanly while the jewellery storefront remains the priority."
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  );
}
