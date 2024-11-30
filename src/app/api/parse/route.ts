// /app/api/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
    try {
        // Parse the form data
        const formData = await req.formData();
        const file = formData.get('resume');

        // Check if the file exists and is of valid type
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        // Extract text based on file type
        if (file.type === 'application/pdf') {
            try {
                const result = await pdf(buffer);
                text = result.text;
            } catch (error) {
                console.error('Error parsing PDF:', error);
                return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 500 });
            }
        } else if (file.type.includes('word')) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
            } catch (error) {
                console.error('Error parsing Word document:', error);
                return NextResponse.json({ error: 'Failed to parse Word document' }, { status: 500 });
            }
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        // Initialize red flags array
        const redFlags: string[] = [];

        // Add sarcastic red flag checks
        if (text.match(/Microsoft Word/i)) redFlags.push("Microsoft Word as a skill? It's 2024, not 2004.");
        if (text.match(/gap/i)) redFlags.push("Career ghosting detected—long gaps in employment history!");
        if (text.match(/team player/i) && text.match(/works independently/i)) redFlags.push("Conflicting personality traits: Team player *and* works independently?");
        if (text.split('\n').length > 100) redFlags.push("Over-sharer alert! Resume is way too long.");
        if (text.match(/hobbies/i) && text.match(/reading|traveling/i)) redFlags.push("Generic hobbies detected: 'Reading' and 'Traveling'—so original!");
        if (text.match(/synergy|paradigm/i)) {
            redFlags.push("Outdated buzzwords detected—are we still in the early 2000s?");
        }
        if (text.match(/perfectionist/i)) {
            redFlags.push("Claims to be a perfectionist—might overthink everything.");
        }
        if (text.match(/fast learner/i)) {
            redFlags.push("Fast learner? How many mistakes along the way?");
        }
        if (text.match(/volunteer/i) === null) {
            redFlags.push("No volunteering experience—self-centered much?");
        }
        if (text.match(/Comic Sans/i)) {
            redFlags.push("Comic Sans on your resume? Really?");
        }
        if (text.match(/achieved|awarded/i) === null) {
            redFlags.push("No achievements listed—what have you been doing?");
        }

        // Calculate ATS score
        const atsScore = Math.max(0, 100 - redFlags.length * 10); // Deduct 10 points per red flag

        return NextResponse.json({
            text, // Extracted text (optional)
            redFlags, // List of sarcastic red flags
            atsScore, // Calculated ATS score
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Server error, please try again later' }, { status: 500 });
    }
}
