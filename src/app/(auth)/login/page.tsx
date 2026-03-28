"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState("");

  return (
    <div className="p-10 max-w-md mx-auto">
      <input
        placeholder="Enter mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-3 w-full mb-4 rounded"
      />

      <button
        onClick={() => {
          console.log("Send OTP");
        }}
        className="w-full bg-red-700 text-white py-3 rounded-full"
      >
        Request OTP
      </button>
    </div>
  );
}