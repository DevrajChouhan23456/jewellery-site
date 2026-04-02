"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LogoPage() {
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.avif");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/logo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.logoUrl);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="luxury-shell luxury-section">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Logo Management</h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage your site logo
        </p>
      </div>

      <div className="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <Image
                src={logoUrl}
                alt="Site Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium">Current Logo</h3>
              <p className="text-sm text-muted-foreground">
                This logo appears in the site header
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="logo-upload" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload New Logo"}
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Recommended: PNG or JPG, max 2MB
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
