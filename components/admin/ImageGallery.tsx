"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ImageIcon,
  Upload,
  Copy,
  Check,
  X,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImageGalleryProps {
  selectedImage: string;
  onImageSelect: (url: string) => void;
  label: string;
  presetImages?: Array<{ label: string; value: string }>;
}

export function ImageGallery({
  selectedImage,
  onImageSelect,
  label,
  presetImages = [],
}: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Upload failed.");
      }

      onImageSelect(data.imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Upload failed."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(selectedImage);
    setCopied(true);
    toast.success("Image URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-stone-950 mb-3">
          {label}
        </label>
      </div>

      {/* Image Preview */}
      <div className="overflow-hidden rounded-[1.75rem] border-2 border-stone-200 bg-stone-50 hover:border-amber-200 transition">
        <div className="relative aspect-video w-full bg-gradient-to-br from-stone-50 to-stone-100">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
              <ImageIcon className="size-12" />
              <span className="text-sm font-medium">No image selected</span>
            </div>
          )}
        </div>

        {/* Quick Actions on Preview */}
        {selectedImage && (
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur p-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy URL
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Image URL Input */}
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-[0.1em]">
          Image URL or paste path
        </label>
        <input
          type="text"
          value={selectedImage}
          onChange={(e) => onImageSelect(e.target.value)}
          placeholder="Enter image URL or paste uploaded path..."
          className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {/* Upload Button */}
      <label className="block">
        <span className="inline-flex cursor-pointer items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-stone-300 bg-white/50 px-4 py-4 text-sm font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50">
          {isUploading ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="size-5" />
              Click to upload or drag & drop
            </>
          )}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>

      {/* Preset Images */}
      {presetImages.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-[0.1em]">
            Preset images
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {presetImages.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onImageSelect(preset.value)}
                className={`relative overflow-hidden rounded-lg border-2 p-2 transition ${
                  selectedImage === preset.value
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-stone-100">
                  <Image
                    src={preset.value}
                    alt={preset.label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="mt-2 text-center text-xs font-medium text-stone-700">
                  {preset.label}
                </p>
                {selectedImage === preset.value && (
                  <div className="absolute top-1 right-1 bg-amber-400 text-white rounded-full p-1">
                    <Check className="size-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
