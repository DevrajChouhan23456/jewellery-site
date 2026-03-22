import { FeaturePlaceholder } from "@/components/feature-placeholder";

type EditNoticePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params;

  return (
    <FeaturePlaceholder
      title={`Editing for notice #${id} is unavailable`}
      description="The legacy notice editor depended on components and models that no longer ship with this storefront. The route now stays build-safe while the admin experience focuses on storefront content."
      backHref="/admin/dashboard/storefront"
      backLabel="Back to storefront editor"
    />
  );
}
