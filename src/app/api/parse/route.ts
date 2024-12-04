import { NextRequest, NextResponse } from "next/server";
import { PdfReader } from "pdfreader"; // Import PdfReader for PDF parsing

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("resume"); // Adjust the key based on your frontend's field name

    let parsedText = "";

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[0]; // Assuming only one file is uploaded

      if (uploadedFile instanceof File) {
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        // Parse the PDF
        parsedText = await new Promise((resolve, reject) => {
          const pdfReader = new PdfReader();
          let extractedText = "";

          pdfReader.parseBuffer(fileBuffer, (err, item) => {
            if (err) {
              console.error("PDF Parsing Error:", err);
              reject("Failed to parse PDF.");
            } else if (!item) {
              // End of file
              resolve(extractedText);
            } else if (item.text) {
              // Append text
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

    // Normalize text
    const normalizedText = parsedText.toLowerCase().replace(/\s+/g, " ").replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII characters

    // ATS Scoring Logic and Red Flags
    const redFlags: string[] = [];

// Example Red Flags
if (normalizedText.includes("microsoft word")) 
  redFlags.push("Microsoft Word as a skill? It's 2024, not 2004.");
if (normalizedText.includes("gap")) 
  redFlags.push("Career ghosting detected—long gaps in employment history!");
if (normalizedText.includes("team player") && normalizedText.includes("works independently")) 
  redFlags.push("Conflicting personality traits: Team player *and* works independently?");
if (normalizedText.split("\n").length > 100) 
  redFlags.push("Over-sharer alert! Resume is way too long.");
if (normalizedText.includes("hobbies") && (normalizedText.includes("reading") || normalizedText.includes("traveling"))) 
  redFlags.push("Generic hobbies detected: 'Reading' and 'Traveling'—so original!");
if (normalizedText.includes("synergy") || normalizedText.includes("paradigm")) 
  redFlags.push("Outdated buzzwords detected—are we still in the early 2000s?");
if (normalizedText.includes("perfectionist")) 
  redFlags.push("Claims to be a perfectionist—might overthink everything.");
if (normalizedText.includes("fast learner")) 
  redFlags.push("Fast learner? How many mistakes along the way?");
if (!normalizedText.includes("volunteer")) 
  redFlags.push("No volunteering experience—self-centered much?");
if (normalizedText.includes("comic sans")) 
  redFlags.push("Comic Sans on your resume? Really?");
if (!normalizedText.includes("achieved") && !normalizedText.includes("awarded")) 
  redFlags.push("No achievements listed—what have you been doing?");
if (normalizedText.includes("python") && normalizedText.includes("excel")) 
  redFlags.push("Python *and* Excel? A data 'pro' who still clings to spreadsheets. Nice.");
if (normalizedText.includes("javascript") && normalizedText.includes("beginner")) 
  redFlags.push("JavaScript beginner? Congrats on mastering alert('Hello, world!').");
if (normalizedText.includes("react") && !normalizedText.includes("typescript")) 
  redFlags.push("React without TypeScript? Just say you enjoy debugging in production.");
if (normalizedText.includes("ai") && normalizedText.includes("beginner")) 
  redFlags.push("AI beginner? Oh, so you renamed your 'Hello, world!' script to 'AI Model'?");
if (normalizedText.includes("gpt-4") || normalizedText.includes("openai")) 
  redFlags.push("GPT-4 experience? Playing 20 questions with ChatGPT doesn’t count as expertise.");
if (normalizedText.includes("figma") && normalizedText.includes("canva")) 
  redFlags.push("Figma and Canva? Wow, a true visionary in *drag and drop* design.");
if (normalizedText.includes("blockchain") && normalizedText.includes("nft")) 
  redFlags.push("Blockchain and NFTs? Say less—we already know you fell for the hype.");
if (normalizedText.includes("agile") && normalizedText.includes("scrum") && normalizedText.includes("leader")) 
  redFlags.push("Agile Scrum leader? Ah yes, the captain of corporate circle jerks.");
if (normalizedText.includes("devops") && !normalizedText.includes("ci/cd")) 
  redFlags.push("DevOps without CI/CD? That’s like being a chef who doesn’t cook.");
if (normalizedText.includes("nosql") && normalizedText.includes("sql")) 
  redFlags.push("SQL *and* NoSQL? Sure, why not claim 'Excel DB' expertise too?");
if (normalizedText.includes("cloud") && !normalizedText.includes("aws") && !normalizedText.includes("azure") && !normalizedText.includes("gcp")) 
  redFlags.push("Cloud experience? What cloud? Google Drive?");
if (normalizedText.includes("github") && !normalizedText.includes("contributions")) 
  redFlags.push("GitHub mentioned, but no contributions? Lurking doesn’t make you a coder.");
if (normalizedText.includes("soft skills")) 
  redFlags.push("'Soft skills'? Let me guess—Excel at 'smiling and nodding.'");
if (normalizedText.includes("team player") && normalizedText.includes("leader")) 
  redFlags.push("Team player and leader? Pick one—this isn’t LinkedIn bingo.");
if (normalizedText.includes("photoshop") && normalizedText.includes("canva")) 
  redFlags.push("Photoshop and Canva? The design equivalent of wearing Crocs with a suit.");
if (normalizedText.includes("machine learning") && !normalizedText.includes("projects")) 
  redFlags.push("Machine Learning without projects? Let me guess, 'watched a YouTube tutorial.'");
if (normalizedText.includes("cybersecurity") && !normalizedText.includes("pen testing") && !normalizedText.includes("soc")) 
  redFlags.push("Cybersecurity without pen testing? Just a hacker movie enthusiast?");
if (normalizedText.includes("kubernetes") && normalizedText.includes("beginner")) 
  redFlags.push("Kubernetes beginner? YAML will eat you alive.");
if (normalizedText.includes("metaverse")) 
  redFlags.push("Metaverse? Oh, you mean that overpriced Sims clone?");
if (normalizedText.includes("ui/ux") && !normalizedText.includes("wireframe") && !normalizedText.includes("user testing")) 
  redFlags.push("UI/UX but no user testing? Aesthetic but useless, like an avocado phone case.");
if (normalizedText.includes("trello") && normalizedText.includes("jira")) 
  redFlags.push("Trello and Jira? Pick one and stop wasting people’s time.");
if (normalizedText.includes("public speaking") && !normalizedText.includes("examples")) 
  redFlags.push("Public speaking with no examples? Practicing in the shower doesn’t count.");
if (normalizedText.includes("coding") && !normalizedText.includes("languages") && !normalizedText.includes("projects")) 
  redFlags.push("Coding experience? Is that just installing VS Code?");
if (normalizedText.includes("entrepreneur") && !normalizedText.includes("startup")) 
  redFlags.push("Entrepreneur with no startup? Aka 'unemployed with an excuse.'");
if (normalizedText.includes("freelance") && normalizedText.includes("beginner")) 
  redFlags.push("Freelance beginner? Let me guess, you’re freelancing 'potential.'");
if (normalizedText.includes("mentorship") && !normalizedText.includes("students") && !normalizedText.includes("mentees")) 
  redFlags.push("Mentorship experience? Mentoring yourself doesn’t count.");
if (normalizedText.includes("eager to learn")) 
  redFlags.push("'Eager to learn'? Translation: 'I don’t know anything yet.'");
if (normalizedText.includes("leadership") && !normalizedText.includes("examples")) 
  redFlags.push("Leadership skills with no examples? Leading your dog doesn’t count.");
if (normalizedText.includes("adaptable")) 
  redFlags.push("'Adaptable'? Is that your excuse for not specializing?");
if (normalizedText.includes("problem solver")) 
  redFlags.push("Problem solver? Yeah, like solving the problem of filling this resume.");
if (normalizedText.includes("ai tools") && !normalizedText.includes("specifics")) 
  redFlags.push("AI tools? ChatGPT isn’t a skill; it’s a lifesaver for this red flag detector.");
if (normalizedText.includes("data visualization") && !normalizedText.includes("tableau") && !normalizedText.includes("powerbi")) 
  redFlags.push("Data visualization? Using Excel charts doesn’t make you an expert.");
if (normalizedText.includes("statistics") && !normalizedText.includes("probability")) 
  redFlags.push("Statistics? Without probability? Like driving without knowing the pedals.");


    // Add more red flags as needed...

    // ATS Score calculation
    let atsScore = Math.max(0, 100 - redFlags.length * 10);
    atsScore = atsScore < 0 ? 0 : atsScore; // Ensure ATS score doesn't go negative

    // Debugging Output
    console.log("Extracted Text:", parsedText.slice(0, 500));
    console.log("Red Flags Triggered:", redFlags);
    console.log("ATS Score:", atsScore);

    // Return result
    return NextResponse.json({ atsScore, redFlags });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing the resume." },
      { status: 500 }
    );
  }
}
