import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function CreateNoticePage() {
  return (
    <FeaturePlaceholder
      title="Notice creation has been retired"
      description="The old notice workflow relied on actions and database models that are no longer present in this project. This placeholder keeps the route stable until a new content publishing system is introduced."
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  );
}
