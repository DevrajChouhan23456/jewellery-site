"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, UploadCloud } from "lucide-react";

type AboutImage = {
  id: number;
  url: string;
  createdAt: string;
};

export default function AboutImagesAdmin() {
  const [images, setImages] = useState<AboutImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about-images");
      const data = await res.json();
      if (Array.isArray(data)) setImages(data);
      else setImages([]);
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image to upload.");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/about-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Upload failed");
      } else {
        setFile(null);
        fetchImages();
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const res = await fetch(`/api/about-images/${id}`, { method: "DELETE" });
    if (res.ok) fetchImages();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload About Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <label className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              {file ? (
                <span>{file.name}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5" /> Click or drag to upload
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {images.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((img) => (
            <Card key={img.id} className="hover:shadow-lg transition-shadow duration-200">
              <Image
                src={img.url}
                alt={`About Image ${img.id}`}
                width={400}
                height={250}
                className="object-cover w-full h-48 rounded-t-lg"
              />
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(img.url, "_blank")}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(img.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
