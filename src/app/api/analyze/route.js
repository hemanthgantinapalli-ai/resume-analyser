import { NextResponse } from "next/server";
import { 
  detectSections, 
  checkFormatting, 
  calculateKeywordMatch, 
  evaluateContentHeuristics,
  calculateATSScore 
} from "@/lib/atsEngine";
import { analyzeResumeWithAI } from "@/lib/aiEngine";
import mammoth from "mammoth";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let jobDescription = "";
    let fileName = "Resume";

    // 1. Parse Input (Multipart Form Data vs JSON)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      jobDescription = formData.get("jobDescription") || "";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      fileName = file.name;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = fileName.split(".").pop().toLowerCase();

      try {
        if (fileExtension === "pdf") {
          // Dynamic import for pdf-parse with multiple fallback strategies
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
              // Attempt to extract readable text segments from the PDF binary
              const bufferStr = fileBuffer.toString("utf8");
              const textSegments = [];
              
              // Extract text between BT (Begin Text) and ET (End Text) operators
              const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
              let match;
              while ((match = btEtRegex.exec(bufferStr)) !== null) {
                const block = match[1];
                // Extract text from Tj and TJ operators
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

          // Final check: if we still have no text or the text looks like raw PDF code, fail gracefully
          if (!pdfParsed || !rawText.trim()) {
            return NextResponse.json({
              error: "Could not extract readable text from this PDF. The file may be image-based (scanned) or use an unsupported encoding. Please try uploading a .docx version or a text-based PDF."
            }, { status: 400 });
          }
        } else if (fileExtension === "docx") {
          const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
          rawText = parsed.value || "";
        } else {
          // Plain text fallback
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
      jobDescription = body.jobDescription || "";
    }

    if (!rawText.trim()) {
      return NextResponse.json({ 
        error: "Failed to extract text from document. Ensure it is not an image-only scan." 
      }, { status: 400 });
    }

    // 2. Section Detection
    const sections = detectSections(rawText);

    // 3. Rule-Based Scoring
    const formattingAnalysis = checkFormatting(rawText, sections);

    // 4. Job Keyword Extraction & Matching
    let jobKeywords = [];
    if (jobDescription) {
      // Basic extraction of capital noun words or key technologies from job description
      const jdTechWords = jobDescription.match(/\b(React|Node\.js|Next\.js|Python|Java|SQL|AWS|Docker|Kubernetes|TypeScript|JavaScript|Git|MongoDB|Express|CSS|HTML|Tailwind|Redux|GraphQL|REST API|CI\/CD)\b/gi) || [];
      // Remove duplicates
      jobKeywords = Array.from(new Set(jdTechWords.map(w => w.toLowerCase())));
      // Capitalize properly for standard comparison display
      jobKeywords = jobKeywords.map(w => {
        if (w === "javascript") return "JavaScript";
        if (w === "typescript") return "TypeScript";
        if (w === "node.js") return "Node.js";
        if (w === "next.js") return "Next.js";
        if (w === "mongodb") return "MongoDB";
        if (w === "aws") return "AWS";
        if (w === "rest api") return "REST API";
        if (w === "ci/cd") return "CI/CD";
        return w.charAt(0).toUpperCase() + w.slice(1);
      });
    }
    
    const keywordAnalysis = calculateKeywordMatch(rawText, jobKeywords);

    // 5. Section Checklist Scoring (25 pts per core section present)
    const coreSections = ["skills", "experience", "projects", "education"];
    let sectionsFoundCount = 0;
    const sectionsStatus = {};
    
    coreSections.forEach(sec => {
      const hasContent = sections[sec] && sections[sec].trim().length > 10;
      sectionsStatus[sec] = !!hasContent;
      if (hasContent) sectionsFoundCount++;
    });
    
    const sectionsScore = sectionsFoundCount * 25;

    // 6. Content Quality Score (Action Verbs and Metrics)
    const contentHeuristics = evaluateContentHeuristics(rawText);

    // 7. Call AI Engine for deep evaluation, suggestions, and weak bullet points
    let aiFeedback = {
      contentQualityScore: contentHeuristics.score,
      suggestions: contentHeuristics.suggestions,
      weakBullets: [
        {
          original: "Helped team build frontend features and fixed UI bugs.",
          improved: "Engineered 12+ critical responsive frontend views, boosting cross-device layout consistency and saving 8+ engineering hours per sprint.",
          reason: "Lacks quantitative impact metrics and starts with collaborative phrasing ('helped') instead of an active verb."
        }
      ],
      extractedKeywords: keywordAnalysis.matched.slice(0, 8),
      suggestedKeywords: keywordAnalysis.missing.slice(0, 5)
    };

    try {
      const deepAIResult = await analyzeResumeWithAI(rawText, jobDescription);
      if (deepAIResult) {
        aiFeedback = {
          contentQualityScore: deepAIResult.contentQualityScore || contentHeuristics.score,
          suggestions: deepAIResult.suggestions?.length ? deepAIResult.suggestions : contentHeuristics.suggestions,
          weakBullets: deepAIResult.weakBullets?.length ? deepAIResult.weakBullets : aiFeedback.weakBullets,
          extractedKeywords: deepAIResult.extractedKeywords?.length ? deepAIResult.extractedKeywords : aiFeedback.extractedKeywords,
          suggestedKeywords: deepAIResult.suggestedKeywords?.length ? deepAIResult.suggestedKeywords : aiFeedback.suggestedKeywords
        };
      }
    } catch (aiError) {
      console.warn("AI Engine failed, falling back to rule-based and mock AI advice.");
    }

    // 8. Consolidated ATS Score calculation
    const finalATSScore = calculateATSScore({
      keywordScore: keywordAnalysis.score,
      formattingScore: formattingAnalysis.score,
      sectionsScore,
      contentScore: aiFeedback.contentQualityScore
    });

    // 9. Formulate Response
    return NextResponse.json({
      fileName,
      wordCount: rawText.split(/\s+/).length,
      atsScore: finalATSScore,
      breakdown: {
        keywords: {
          score: keywordAnalysis.score,
          matched: keywordAnalysis.matched,
          missing: keywordAnalysis.missing
        },
        formatting: {
          score: formattingAnalysis.score,
          hasEmail: formattingAnalysis.hasEmail,
          hasPhone: formattingAnalysis.hasPhone,
          hasLinks: formattingAnalysis.hasLinks,
          wordCount: formattingAnalysis.wordCount,
          bulletPointsCount: formattingAnalysis.bulletPointsCount,
          feedback: formattingAnalysis.lengthFeedback,
          issues: formattingAnalysis.formattingIssues
        },
        sections: {
          score: sectionsScore,
          status: sectionsStatus
        },
        content: {
          score: aiFeedback.contentQualityScore,
          suggestions: aiFeedback.suggestions,
          weakBullets: aiFeedback.weakBullets
        }
      },
      parsedText: rawText
    });

  } catch (error) {
    console.error("Resume analysis API route crash:", error);
    return NextResponse.json({ 
      error: "An internal server error occurred while analyzing the resume: " + error.message 
    }, { status: 500 });
  }
}
