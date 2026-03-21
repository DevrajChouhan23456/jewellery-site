"use client";
import React, { useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useEffect } from "react";
import prisma from "@/lib/prisma";
import { ArrowBigLeft, ArrowBigRight, ArrowLeft, ArrowLeftFromLine,  } from "lucide-react";
import Link from "next/link";
export function BlurFadeDemo() {
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setImages(data.map((img: any) => img.imageUrl)))
      .catch((err) => console.error("Failed to fetch images", err));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/gallery", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newImage = await res.json();
      setImages((prev) => [newImage.imageUrl, ...prev]);
    } else {
      console.error("Upload failed", await res.json());
    }
  };

  return (
    <section id="photos">
      <div className="columns-2 gap-4 sm:columns-5 mx-5">
        {/* Upload card */}
        <div className="mb-4 p-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition relative group">
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <span className="text-gray-500 font-medium text-center">
              + Upload Images
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
        {/* {noticesWithDate.map((notice) => (
            <DashboardNoticeCard
              key={notice.id}
              id={notice.id}
              title={notice.title}
              createdAt={notice.createdAt}
            />
          ))} */}

        {images.map((url, i) => (
          <BlurFade key={i}>
            <img
              className="mb-4 w-full rounded-lg object-contain hover:scale-105"
              src={url}
              alt="gallery"
              // className="w-full rounded-lg"
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

function DashboardGallerySection() {
  return (
    <div className="w-fit mx-auto">
      <div className="my-5 mx-5 flex">
     <Link href="/user/dashboard"><ArrowLeft className="w-15 hover:scale-120"/></Link>
      </div>
      <div className="my-5 text-center">
        <h1 className="text-3xl font-bold">Gallery Section</h1>
      </div>
      <BlurFadeDemo />
    </div>
  );
}

export default DashboardGallerySection;
