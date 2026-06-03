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
          const pdf = require("pdf-parse");
          const parsed = await pdf(fileBuffer);
          rawText = parsed.text || "";
        } else if (fileExtension === "docx") {
          const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
          rawText = parsed.value || "";
        } else {
          // Plain text fallback
          rawText = fileBuffer.toString("utf8");
        }
      } catch (parseError) {
        console.error("Document parser failed. Trying raw text decode fallback:", parseError);
        rawText = fileBuffer.toString("utf8").replace(/[^\x20-\x7E\r\n\t]/g, ""); // strip binary
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
