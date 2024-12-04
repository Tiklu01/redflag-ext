// app/popup/page.tsx
'use client'

import React from 'react';
import { FileUploadDemo } from '@/components/FileUploadDemo';

export default function Popup() {
  return (
    <main className="bg-black text-white flex items-center justify-center min-h-[400px] max-h-[600px] w-[400px] p-4 overflow-y-auto">
      <div className="w-full max-w-full mx-auto p-6 border border-neutral-800 rounded-lg shadow-lg bg-neutral-900">
        <h1 className="text-xl font-semibold text-center mb-4">Resume ATS Checker</h1>
        <FileUploadDemo />
      </div>
    </main>
  );
}
