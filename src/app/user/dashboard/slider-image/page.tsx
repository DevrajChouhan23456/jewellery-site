"use client";
import React, { useState, useEffect } from "react";
import { ArrowBigLeft, ArrowBigRight, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

type SliderImage = {
  id: number;
  imageUrl: string;
};

export default function SliderManager() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/slider")
      .then((res) => res.json())
      .then((data: SliderImage[]) => setImages(data))
      .catch((err) => console.error("Failed to fetch slider images", err));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/slider", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newImage: SliderImage = await res.json();
      setImages((prev) => [...prev, newImage]);
    }
  };

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/slider/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setImages((prev) => prev.filter((img) => img.id !== id));
      setCurrent(0); // reset to first image if current deleted
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Back button */}
    <div className="my-5 mx-5 flex">
     <Link href="/user/dashboard"><ArrowLeft className="w-15 hover:scale-120"/></Link>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Slider Image Manager</h1>
      </div>

      {/* Upload */}
      <div className="mb-6 flex justify-center">
        <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
          + Upload Slider Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Slider Preview */}
      {images.length > 0 ? (
        <div className="relative flex items-center justify-center">
          <ArrowBigLeft
            className="absolute left-[-10px] w-10 h-10 cursor-pointer hover:scale-110"
            onClick={() =>
              setCurrent((prev) => (prev - 1 + images.length) % images.length)
            }
          />
          <img
            src={images[current].imageUrl}
            alt="slider"
            className="rounded-xl w-full max-h-[400px] object-contain"
          />
          <ArrowBigRight
            className="absolute right-[-10px] w-10 h-10 cursor-pointer hover:scale-110"
            onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
          />
          <button
            onClick={() => handleDelete(images[current].id)}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500">No slider images yet.</p>
      )}
    </div>
  );
}
