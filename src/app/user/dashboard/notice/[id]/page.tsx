import { FeaturePlaceholder } from "@/components/feature-placeholder";

type NoticeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardNoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { id } = await params;

  return (
    <FeaturePlaceholder
      title={`Notice #${id} is unavailable`}
      description="Notice records are not part of the current jewellery database schema. This route now shows a safe fallback instead of failing the production build."
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  );
}
