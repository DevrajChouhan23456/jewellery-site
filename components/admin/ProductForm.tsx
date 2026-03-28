"use client";

import { useState } from "react";

export default function ProductForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const rawImages = form.get("images");

    const data = {
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || ""),
      price: Number(form.get("price") || 0),
      category: String(form.get("category") || "jewellery"),
      subCategory: String(form.get("subCategory") || "") || null,
      material: String(form.get("material") || "gold"),
      type: String(form.get("type") || "ring"),
      images:
        typeof rawImages === "string"
          ? rawImages
              .split(",")
              .map((image) => image.trim())
              .filter(Boolean)
          : [],
    };

    await fetch("/api/admin/product/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    setLoading(false);
    alert("Product created.");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <input name="name" placeholder="Product Name" className="input w-full" required />
      <input name="slug" placeholder="slug-name" className="input w-full" required />
      <input name="price" placeholder="Price" type="number" className="input w-full" required />
      <input name="category" placeholder="Category" className="input w-full" defaultValue="jewellery" />
      <input name="subCategory" placeholder="Sub-category" className="input w-full" />
      <input name="material" placeholder="Material" className="input w-full" defaultValue="gold" />
      <input name="type" placeholder="Type" className="input w-full" defaultValue="ring" />
      <input name="images" placeholder="image1.jpg,image2.jpg" className="input w-full" />

      <button type="submit" className="rounded bg-black px-4 py-2 text-white">
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
