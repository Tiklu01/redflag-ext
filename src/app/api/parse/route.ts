import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json"; // To parse the PDF

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("resume"); // Adjust the key based on your frontend's field name

    let parsedText = "";

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[0]; // Assuming only one file is uploaded

      // Validate uploaded file type
      if (uploadedFile instanceof File) {
        // Convert uploaded file to Buffer
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        // Parse the PDF using pdf2json
        const pdfParser = new PDFParser(null); // Disable saving to file system

        // Return a promise to handle asynchronous text extraction
        parsedText = await new Promise((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (errData) => {
            console.error("PDF Parsing Error:", errData.parserError);
            reject("Failed to parse PDF.");
          });

          pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
          });

          pdfParser.parseBuffer(fileBuffer); // Directly parse the buffer
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

    // ATS Scoring Logic and Red Flags
    const redFlags: string[] = [];
    if (/Microsoft Word/i.test(parsedText)) redFlags.push("Microsoft Word as a skill? It's 2024, not 2004.");
    if (/gap/i.test(parsedText)) redFlags.push("Career ghosting detected—long gaps in employment history!");
    if (/team player/i.test(parsedText) && /works independently/i.test(parsedText)) redFlags.push("Conflicting personality traits: Team player *and* works independently?");
    if (parsedText.split("\n").length > 100) redFlags.push("Over-sharer alert! Resume is way too long.");
    if (/hobbies/i.test(parsedText) && /reading|traveling/i.test(parsedText)) redFlags.push("Generic hobbies detected: 'Reading' and 'Traveling'—so original!");
    if (/synergy|paradigm/i.test(parsedText)) redFlags.push("Outdated buzzwords detected—are we still in the early 2000s?");
    if (/perfectionist/i.test(parsedText)) redFlags.push("Claims to be a perfectionist—might overthink everything.");
    if (/fast learner/i.test(parsedText)) redFlags.push("Fast learner? How many mistakes along the way?");
    if (!/volunteer/i.test(parsedText)) redFlags.push("No volunteering experience—self-centered much?");
    if (/Comic Sans/i.test(parsedText)) redFlags.push("Comic Sans on your resume? Really?");
    if (!/achieved|awarded/i.test(parsedText)) redFlags.push("No achievements listed—what have you been doing?");

    // Calculate ATS score
    const atsScore = Math.max(0, 100 - redFlags.length * 10);

    // Return the parsed data
    return NextResponse.json({
      text: parsedText.slice(0, 500), // Return first 500 characters for debugging (optional)
      redFlags,
      atsScore,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
