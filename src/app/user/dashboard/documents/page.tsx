"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Document = {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
  createdAt: string;
};

export default function DocumentDisplay() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    category: "",
  });

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || "",
      fileUrl: doc.fileUrl,
      category: doc.category || "",
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      const res = await fetch(`/api/documents/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update document");
      const updated = await res.json();
      setDocuments(documents.map((doc) => (doc.id === updated.id ? updated : doc)));
      setEditingDoc(null);
      setFormData({ title: "", description: "", fileUrl: "", category: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id} className="border shadow hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>{doc.category || "No category"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">{doc.description || "No description"}</p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline text-sm"
                >
                  View File
                </a>
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No documents found.</p>
        )}
      </div>

      {/* Edit Document Dialog */}
      {editingDoc && (
        <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>Update document details below</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File URL</label>
                <Input
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit">Update</Button>
                <Button type="button" variant="outline" onClick={() => setEditingDoc(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
