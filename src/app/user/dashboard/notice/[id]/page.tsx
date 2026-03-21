import prisma from "@/lib/prisma";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import DeleteNoticeButton from "@/components/DeleteNotice";
import { Button } from "../../../../../components/ui/button";

type NoticeDetailPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const notices = await prisma.notice.findMany({ select: { id: true } });
  return notices.map((notice) => ({ id: notice.id.toString() }));
}

export default async function DashboardNoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const id = parseInt(params.id);
  const notice = await prisma.notice.findUnique({ where: { id } });

  if (!notice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-10">
        <h1 className="text-xl text-muted-foreground">Notice not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-10">
      {/* Header */}
      <div className="justify-between items-center">
        <Link
          href="/user/dashboard/notice"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <MoveLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Notices</span>
        </Link>

        <div className="mx-10 my-3">
          <h1
            className="text-3xl font-semibold tracking-tight mt-4 break-words text-primary"
            dangerouslySetInnerHTML={{ __html: notice.title }}
          />

          <div className="flex justify-end mx-10 gap-5">
            <Link href={`/user/dashboard/notice/${id}/edit`}>
              <Button>Edit Notice</Button>
            </Link>
            <DeleteNoticeButton noticeId={notice.id} />
          </div>
        </div>
      </div>

      {/* Notice Content */}
      <div className="max-w-4xl mx-auto bg-background border border-border rounded-2xl p-8 shadow-lg space-y-6">
        {/* ✅ Featured Image */}
        {notice.image && (
          <div className="flex justify-center">
            <img
              src={notice.image}
              alt={notice.title}
              className="rounded-xl shadow-md max-h-[400px] object-contain"
            />
          </div>
        )}

        {/* ✅ Text (without editor <img> tags) */}
        <div
          className="prose prose-lg max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: notice.notice.replace(/<img[^>]*>/g, ""), // remove editor images
          }}
        />
      </div>
    </div>
  );
}
