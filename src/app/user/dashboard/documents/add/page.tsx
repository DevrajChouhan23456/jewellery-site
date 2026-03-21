"use client";

import { useState } from "react";

export default function AdminUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // Max file size = 10 MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage("❌ File too large! Max size is 10 MB.");
        setFile(null);
        e.target.value = ""; // reset input
      } else {
        setMessage("");
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("❌ Please select a valid file under 10 MB.");
      return;
    }

    try {
      // Convert file -> Base64 (Cloudinary needs it in free plan)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result;

        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            file: base64File,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage("✅ Uploaded successfully!");
          setTitle("");
          setDescription("");
          setCategory("");
          setFile(null);
        } else {
          setMessage(`❌ Upload failed: ${data.error}`);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ Something went wrong during upload.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl my-15">
      <h2 className="text-xl font-bold mb-4">📄 Upload Document</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
