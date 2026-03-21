"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { Trash2 } from "lucide-react";

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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inquiry")
      .then((res) => res.json())
      .then((data) => {
        setInquiries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/inquiry/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    }
  };

  if (loading) {
    return <p className="text-center p-6">Loading inquiries...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Admission Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
               
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <TableRow key={inq.id} className="hover:bg-gray-50">
                    <TableCell>{inq.student}</TableCell>
                    <TableCell>{inq.parent || "-"}</TableCell>
                    <TableCell>{inq.email}</TableCell>
                    <TableCell>{inq.phone}</TableCell>
                    <TableCell>{inq.className}</TableCell>
                    <TableCell>{inq.message || "-"}</TableCell>
                    <TableCell>
                      {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </TableCell>
                 
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 py-6"
                  >
                    No inquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
