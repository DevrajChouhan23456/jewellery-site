"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LogoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    const res = await fetch("/api/logo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Update Store Logo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Logo</CardTitle>
          <CardDescription>
            Upload a new logo for the jewellery storefront branding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" /> Choose a PNG/JPG image
              </div>
              <label className="cursor-pointer px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    if (f) setPreview(URL.createObjectURL(f));
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {preview ? (
              <Image
                src={preview}
                alt="Logo preview"
                width={160}
                height={80}
                unoptimized
                className="h-20 w-auto"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" /> No image selected
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload Logo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
