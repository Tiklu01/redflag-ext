import { NextRequest, NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("resume");

    let parsedText = "";

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[0];

      if (uploadedFile instanceof File) {
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        parsedText = await new Promise((resolve, reject) => {
          const pdfReader = new PdfReader();
          let extractedText = "";

          pdfReader.parseBuffer(fileBuffer, (err, item) => {
            if (err) {
              reject("Failed to parse PDF.");
            } else if (!item) {
              resolve(extractedText);
            } else if (item.text) {
              extractedText += item.text + " ";
            }
          });
        });
      } else {
        return NextResponse.json(
          { error: "Uploaded file is not in the expected format." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const normalizedText = parsedText
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\x00-\x7F]/g, "");

    const prompt = `
You are an expert resume reviewer and ATS evaluator.

1. Analyze the following resume content.
2. List potential red flags in a sarcastic tone that could hurt the candidate's chances.
3. Assign an ATS score between 0 and 100 based on relevance, clarity, formatting, and keywords.

Resume:
"""
${normalizedText}
"""

Respond in this format:
Red Flags:
- ...
- ...
ATS Score: <score>
`;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();

    const redFlags: string[] = [];
    let atsScore = 0;

    for (const line of responseText.split("\n")) {
      if (line.trim().startsWith("-")) {
        redFlags.push(line.trim().replace(/^[-•]\s*/, ""));
      } else if (line.toLowerCase().includes("ats score")) {
        const match = line.match(/(\d{1,3})/);
        if (match) atsScore = Math.min(100, parseInt(match[1]));
      }
    }

    return NextResponse.json({ atsScore, redFlags });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing the resume." },
      { status: 500 }
    );
  }
}
