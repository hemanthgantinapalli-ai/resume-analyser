import { NextResponse } from "next/server";
import { 
  detectSections, 
  checkFormatting, 
  calculateKeywordMatch, 
  evaluateContentHeuristics,
  calculateATSScore 
} from "@/lib/atsEngine";
import { improveResumeWithAI } from "@/lib/aiEngine";
import { dbSaveResume } from "@/lib/db";
import mammoth from "mammoth";

/**
 * Helper function to calculate ATS score of a given resume text.
 * Reuses the standard algorithms from the atsEngine.
 */
function calculateTextScore(text) {
  const sections = detectSections(text);
  const formatting = checkFormatting(text, sections);
  const keywordMatch = calculateKeywordMatch(text, []);
  
  const coreSections = ["skills", "experience", "projects", "education"];
  let sectionsFoundCount = 0;
  coreSections.forEach(sec => {
    const hasContent = sections[sec] && sections[sec].trim().length > 10;
    if (hasContent) sectionsFoundCount++;
  });
  const sectionsScore = sectionsFoundCount * 25;
  const content = evaluateContentHeuristics(text);
  
  return calculateATSScore({
    keywordScore: keywordMatch.score,
    formattingScore: formatting.score,
    sectionsScore,
    contentScore: content.score
  });
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let tone = "technical";
    let userId = "anonymous";

    // 1. Parse Input (Multipart Form Data vs JSON)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      tone = formData.get("tone") || "technical";
      // Try to read x-user-id or userId from formData or headers
      userId = formData.get("x-user-id") || formData.get("userId") || req.headers.get("x-user-id") || req.headers.get("userId") || "anonymous";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const fileName = file.name;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = fileName.split(".").pop().toLowerCase();

      try {
        if (fileExtension === "pdf") {
          let pdfParsed = false;
          
          try {
            const pdf = require("pdf-parse");
            const parsed = await pdf(fileBuffer);
            rawText = parsed.text || "";
            pdfParsed = true;
          } catch (pdfError) {
            console.warn("pdf-parse primary attempt failed:", pdfError.message);
          }

          // If pdf-parse failed, try a lightweight text extraction from PDF buffer
          if (!pdfParsed || !rawText.trim()) {
            try {
              const bufferStr = fileBuffer.toString("utf8");
              const textSegments = [];
              const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
              let match;
              while ((match = btEtRegex.exec(bufferStr)) !== null) {
                const block = match[1];
                const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
                if (tjMatches) {
                  tjMatches.forEach(m => {
                    const text = m.match(/\(([^)]*)\)/)?.[1];
                    if (text && text.trim()) textSegments.push(text.trim());
                  });
                }
              }
              
              if (textSegments.length > 5) {
                rawText = textSegments.join("\n");
                pdfParsed = true;
              }
            } catch (fallbackError) {
              console.warn("PDF text extraction fallback failed:", fallbackError.message);
            }
          }

          if (!pdfParsed || !rawText.trim()) {
            return NextResponse.json({
              error: "Could not extract readable text from this PDF. The file may be image-based (scanned) or use an unsupported encoding. Please try uploading a .docx version or a text-based PDF."
            }, { status: 400 });
          }
        } else if (fileExtension === "docx") {
          const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
          rawText = parsed.value || "";
        } else {
          rawText = fileBuffer.toString("utf8");
        }
      } catch (parseError) {
        console.error("Document parser failed:", parseError);
        return NextResponse.json({
          error: "Failed to parse the uploaded document. Please try a different file format (.docx or text-based .pdf)."
        }, { status: 400 });
      }

      // Safety check: detect if extracted text is actually raw PDF source code
      const looksLikePdfSource = (text) => {
        const pdfIndicators = ["%PDF-", "endobj", "endstream", "/Type/Page", "0 obj", "/Font", "/MediaBox"];
        const matchCount = pdfIndicators.filter(indicator => text.includes(indicator)).length;
        return matchCount >= 3;
      };

      if (looksLikePdfSource(rawText)) {
        return NextResponse.json({
          error: "The PDF text extraction returned raw PDF code instead of readable content. This usually happens with scanned/image-based PDFs. Please upload a text-based PDF or a .docx file."
        }, { status: 400 });
      }
    } else {
      // Direct JSON text testing
      const body = await req.json();
      rawText = body.text || "";
      tone = body.tone || "technical";
      userId = body.userId || req.headers.get("x-user-id") || req.headers.get("userId") || "anonymous";
    }

    if (!rawText.trim()) {
      return NextResponse.json({ 
        error: "Failed to extract text from document or empty input provided." 
      }, { status: 400 });
    }

    // 2. Calculate Original ATS Score
    const originalScore = calculateTextScore(rawText);

    // 3. Improve Resume via AI Engine
    const aiResult = await improveResumeWithAI(rawText, tone);
    
    if (!aiResult || !aiResult.improvedText) {
      throw new Error("AI engine failed to generate improved text.");
    }

    const improvedText = aiResult.improvedText;
    const changes = aiResult.changes || [];

    // 4. Calculate Improved ATS Score
    const improvedScore = calculateTextScore(improvedText);
    
    // Calculate final score delta
    const actualDelta = improvedScore - originalScore;
    const finalScoreDelta = actualDelta > 0 ? actualDelta : (aiResult.scoreDelta || 15);

    // 5. Store in Database (MongoDB or fallback local JSON database via unified dbServices)
    try {
      await dbSaveResume({
        userId,
        title: "AI Improved Resume",
        rawText: improvedText,
        structuredData: {
          originalText: rawText,
          tone,
          changes
        },
        templateId: "modern",
        atsScore: improvedScore
      });
    } catch (dbError) {
      console.error("Failed to save improved resume to DB:", dbError);
    }

    // 6. Formulate Response (satisfying both clients)
    return NextResponse.json({
      originalScore,
      improvedScore,
      improvedText,
      improvedResume: improvedText, // backward compatibility for ResumeUploader.jsx
      scoreDelta: finalScoreDelta,
      changes
    });

  } catch (error) {
    console.error("Resume improvement API route crash:", error);
    return NextResponse.json({ 
      error: "An error occurred while optimizing the resume: " + error.message 
    }, { status: 500 });
  }
}
