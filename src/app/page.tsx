"use client";

import React from "react";
import { FileUploadDemo } from "@/components/FileUploadDemo";

export default function Home() {
  return (
      <main className="bg-black text-white flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto p-6 border border-neutral-800 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6">
            Resume ATS Checker
          </h1>
          <FileUploadDemo />
        </div>
      </main>
  );
}
