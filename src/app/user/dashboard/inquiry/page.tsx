"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Inquiry = {
  id: number;
  student: string;
  parent: string | null;
  email: string;
  phone: string;
  className: string;
  message: string | null;
  createdAt: string;
};

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    fetch("/api/inquiry")
      .then((res) => res.json())
      .then((data) => setInquiries(data || []))
      .catch((err) => console.error("Failed to fetch inquiries", err));
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-muted/10">
      <Card className="max-w-7xl mx-auto shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
            Admission Inquiries
          </CardTitle>
        </CardHeader>

        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Loading inquiries...
            </p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full text-sm sm:text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Parent</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden sm:table-cell">Class</TableHead>
                    <TableHead className="hidden lg:table-cell">Message</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{inq.student}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {inq.parent || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {inq.email}
                      </TableCell>
                      <TableCell>{inq.phone}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {inq.className}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {inq.message || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
