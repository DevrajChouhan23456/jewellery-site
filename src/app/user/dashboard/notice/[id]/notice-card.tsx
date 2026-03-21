"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NoticeCardProps {
  id: number;
  title: string;
}

export const NoticeCard = ({ id, title }: NoticeCardProps) => {
  return (
    <div className="bg-background border border-muted rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground break-words">{title}</h2>
        <Link href={`/notice/${id}`}>
          <Button variant="link" className="text-primary text-sm">
            View
          </Button>
        </Link>
      </div>
    </div>
  );
};
