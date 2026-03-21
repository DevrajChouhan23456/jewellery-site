
import prisma from "../../../../lib/prisma";
import { NoticeCard } from "../../../../components/notice-card"; // Import the component
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { DashboardNoticeCard } from "../../../../components/dashboardnotice-card";

export default async function DashboardNoticePage() {
  const notices = await prisma.notice.findMany();

  // Convert createdAt to Date objects
  const noticesWithDate = notices.map(notice => ({
    ...notice,
    createdAt: new Date(notice.createdAt)
  }));

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary">School Notices</h1>
          <Link href="/user/dashboard/notice/new" className="btn btn-primary">
          <Button className="w-full" type="submit">
            Create Notice
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {noticesWithDate.map((notice) => (
          <DashboardNoticeCard key={notice.id} id={notice.id} title={notice.title} createdAt={notice.createdAt} />
        ))}
      </div>
    </div>
  );
}
