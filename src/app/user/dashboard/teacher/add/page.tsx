"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TeacherForm = {
  name: string;
  role: string;
  subject: string;
  bio: string;
  imageUrl: string;
};

export default function TeacherAdd() {
  const [form, setForm] = useState<TeacherForm>({
    name: "",
    role: "",
    subject: "",
    bio: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/teacher/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.role || !form.imageUrl) {
      alert("Please fill all required fields and upload an image");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save teacher");

      alert("Teacher added successfully!");
      setForm({ name: "", role: "", subject: "", bio: "", imageUrl: "" });
    } catch (err) {
      console.error("Save error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center my-15">
      <div className="justify-items-start">
        <Link href="/user/dashboard">
          <ArrowLeft className="w-15 hover:scale-120" />
        </Link>
      </div>
      <div className="mx-auto w-lg">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Update Teacher Information</CardTitle>
            <CardDescription>Add new teacher details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Teacher Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter teacher name"
                  required
                />
              </div>

              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                </select>
              </div>

              {/* Subject - only for Teachers */}
              {form.role === "Teacher" && (
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics, Science"
                    required={form.role === "Teacher"}
                  />
                </div>
              )}

              {/* Bio */}
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Short bio"
                />
              </div>

              {/* Image upload */}
              <div className="mb-4 flex justify-center">
                <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
                  + Upload Teacher Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview uploaded image */}
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Teacher"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
              )}

              {/* Submit */}
              <CardFooter>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Update Teacher"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
