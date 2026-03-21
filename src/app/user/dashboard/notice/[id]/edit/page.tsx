/* Removed checkFields type check to fix build error */

// In your page file: app/notice/[id]/edit/page.tsx

import React from "react";
import { notFound } from "next/navigation";
// import EditNoticeForm from "@/components/editNoticeForm";
// import prisma from "@/lib/prisma";
import type { Metadata } from "next"; // Import the Metadata type

import Prisma from "@/lib/prisma";
import EditNoticeForm from "@/components/editNoticeForm";
interface EditNoticePageProps {
  params: Promise<{ id: string }>;
}
export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params; // ✅ await params
  const noticeId = Number(id);

  if (isNaN(noticeId)) {
    throw new Error("Invalid notice ID");
  }
  const notice = await Prisma.notice.findUnique({
    where: { id: noticeId },
  });

  if (!notice) return <div>Notice not found</div>;

  // Convert dates for serialization
  const serialized = {
    ...notice,
    createdAt: notice.createdAt.toISOString(),
    updatedAt: notice.updatedAt.toISOString(),
  };

  return <EditNoticeForm notice={serialized} />;
}
