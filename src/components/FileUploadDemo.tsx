"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export function FileUploadDemo() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<string[] | null>(null);
    const [score, setScore] = useState<number | null>(null);

    const handleFileUpload = async (uploadedFiles: File[]) => {
        setFiles(uploadedFiles);
        if (uploadedFiles.length === 0) return alert("No file uploaded.");

        // Ensure only valid file types are uploaded (PDF or Word)
        const file = uploadedFiles[0];
        if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.multiprocessing.document"].includes(file.type)) {
            return alert("Invalid file type. Please upload a PDF or Word document.");
        }

        setLoading(true);
        setFeedback(null);
        setScore(null);

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await fetch("/api/parse", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to upload file");
            }

            setFeedback(data.redFlags);
            setScore(data.atsScore);
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
            {loading && (
                <div className="flex flex-col items-center">
                    <p className="mt-4 text-gray-600">Processing your resume...</p>
                </div>
            )}
            {score !== null && (
                <div className="w-40 h-40 mt-6 mx-auto">
                    <CircularProgressbar
                        value={score}
                        text={`${score}%`}
                        styles={buildStyles({
                            textColor: score >= 70 ? "#4caf50" : "#f44336",
                            pathColor: score >= 70 ? "#4caf50" : "#f44336",
                            trailColor: "#d6d6d6",
                        })}
                    />
                </div>
            )}
            {feedback && (
                <div className="mt-6 p-4 border border-gray-300 rounded">
                    <h2 className="text-xl font-semibold">Red Flags Found:</h2>
                    <ul className="list-disc list-inside">
                        {feedback.map((flag, idx) => (
                            <li key={idx} className="text-red-600">
                                {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
