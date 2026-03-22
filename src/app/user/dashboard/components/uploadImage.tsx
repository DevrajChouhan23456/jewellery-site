import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function DashboardGallerySection() {
  return (
    <FeaturePlaceholder
      title="Gallery uploads are not wired in this project"
      description="The previous gallery manager expected APIs and effects that are not part of the current storefront app. This placeholder keeps the route compiling cleanly without shipping a broken uploader."
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  );
}
