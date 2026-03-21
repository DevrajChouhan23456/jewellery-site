"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Pencil, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Teacher = {
  id: number;
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
};

export default function TeacherGallery() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
  });

  // Fetch teachers
  useEffect(() => {
    fetch("/api/teacher")
      .then((res) => res.json())
      .then(setTeachers)
      .catch((err) => console.error("Failed to fetch teachers", err));
  }, []);

  // Delete teacher
  async function handleDelete(id: number) {
    const res = await fetch(`/api/teacher/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    }
  }

  // Start editing
  function startEdit(t: Teacher) {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role,
      bio: t.bio || "",
      imageUrl: t.imageUrl,
    });
  }

  // Save edit
  async function handleSave() {
    if (!editing) return;
    const res = await fetch(`/api/teacher/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = await res.json();
      setTeachers((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setEditing(null);
    }
  }

  const handleReupload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/teacher/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, imageUrl: updated.imageUrl } : t
        )
      );
    }
  };

  const triggerFileInput = (id: number) => {
    fileInputs.current[id]?.click();
  };

  // Filter out Principal & Vice Principal
  const visibleTeachers = teachers.filter(
    (t) =>
      t.role.toLowerCase() !== "principal" &&
      t.role.toLowerCase() !== "vice principal"
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/user/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Teacher Gallery</h1>
      </div>

      {/* Teacher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleTeachers.map((t) => (
          <Card
            key={t.id}
            className="shadow-sm hover:shadow-md transition rounded-2xl"
          >
            <CardHeader className="flex flex-col items-center text-center">
              {t.imageUrl ? (
                <Image
                  src={t.imageUrl}
                  alt={t.name}
                  width={128}
                  height={128}
                  className="w-28 h-28 object-cover rounded-full mb-3"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  No Image
                </div>
              )}
              <CardTitle className="text-lg">{t.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </CardHeader>

            <CardContent className="text-sm text-center text-muted-foreground">
              {t.bio || "No bio available"}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => startEdit(t)}
              >
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>

              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputs.current[t.id] = el;
                }}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReupload(t.id, file);
                }}
              />

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => triggerFileInput(t.id)}
              >
                <Upload className="w-4 h-4 mr-1" /> Re-upload
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> 
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
            />
            <Input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role"
            />
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
