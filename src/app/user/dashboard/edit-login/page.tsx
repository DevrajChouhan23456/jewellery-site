"use client";

import React from "react";
import { EditLoginCard } from "./editloginCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResetButton from "./resetButton";

export default function EditLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Back Button */}
      <div className="p-4 sm:p-6 flex items-center">
        <Link href="/admin/dashboard">
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 hover:text-gray-900 transition-transform hover:scale-110" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-4">
          {/* Login Card */}
          <EditLoginCard />

          {/* Reset Button below Save */}
          <ResetButton />
        </div>
      </div>
    </div>
  );
}
