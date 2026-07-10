import { NextResponse } from "next/server";
import { 
  detectSections, 
  checkFormatting, 
  calculateKeywordMatch, 
  evaluateContentHeuristics,
  calculateATSScore,
  categorizeSkills,
  generateFinalVerdict
} from "@/lib/atsEngine";
import { analyzeResumeWithAI, improveResumeWithAI } from "@/lib/aiEngine";
import { parseResumeBuffer, buildStructuredResumeText } from "@/lib/resumeParser";

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
        const parserResult = await parseResumeBuffer(fileBuffer, fileName);
        rawText = parserResult.rawText || "";

        if (!rawText.trim()) {
          return NextResponse.json({
            error: parserResult.error || "Unable to extract readable resume content. Please upload a proper text-based PDF."
          }, { status: 400 });
        }
      } catch (parseError) {
        console.error("Document parser failed:", parseError);
        return NextResponse.json({
          error: "Failed to parse the uploaded document. Please try a different file format (.docx or text-based .pdf)."
        }, { status: 400 });
      }

    } else {
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
    const cleanedText = buildStructuredResumeText(rawText);

    // 3. Rule-Based Scoring
    const formattingAnalysis = checkFormatting(rawText, sections);

    // 4. Job Keyword Extraction & Matching
    let jobKeywords = [];
    if (jobDescription) {
      const jdTechWords = jobDescription.match(/\b(React|Node\.js|Next\.js|Python|Java|SQL|AWS|Docker|Kubernetes|TypeScript|JavaScript|Git|MongoDB|Express|CSS|HTML|Tailwind|Redux|GraphQL|REST API|CI\/CD)\b/gi) || [];
      jobKeywords = Array.from(new Set(jdTechWords.map(w => w.toLowerCase())));
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

    // 5. Full Section Checklist (all 5 required sections)
    const ALL_SECTIONS = ["summary", "skills", "experience", "projects", "education"];
    const SECTION_TIPS = {
      summary: "Add a 3–4 line professional summary at the top highlighting your role, tech stack, and career impact.",
      skills: "Include a dedicated Skills section listing your technical tools, languages, and frameworks.",
      experience: "Add a Work Experience section with company names, roles, dates, and bullet-pointed achievements.",
      projects: "Include a Projects section showcasing relevant personal or academic builds with tech stack details.",
      education: "Add an Education section with your degree, institution, and graduation year."
    };

    const sectionsStatus = {};
    const sectionsTips = {};
    let sectionsFoundCount = 0;

    ALL_SECTIONS.forEach(sec => {
      const hasContent = sections[sec] && sections[sec].trim().length > 10;
      sectionsStatus[sec] = !!hasContent;
      sectionsTips[sec] = hasContent
        ? `✓ ${sec.charAt(0).toUpperCase() + sec.slice(1)} section detected with content.`
        : SECTION_TIPS[sec];
      if (hasContent) sectionsFoundCount++;
    });

    // Score based on all 5 sections (20 pts each)
    const sectionsScore = Math.min(100, sectionsFoundCount * 20);

    // 6. Content Quality Score (Action Verbs and Metrics)
    const contentHeuristics = evaluateContentHeuristics(rawText);

    // 7. Extract skills from rawText for categorization
    const skillsSection = sections.skills || "";
    const rawSkillTokens = skillsSection
      .split(/[\n,|•·]+/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 40);
    const categorizedSkills = categorizeSkills(rawSkillTokens);

    // 8. AI Engine — deep evaluation
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
      suggestedKeywords: keywordAnalysis.missing.slice(0, 12),
      professionalSummaryRewrite: "Results-driven Software Engineer with proven experience in architecting scalable solutions and optimizing system performance. Adept at leveraging modern web technologies to drive business growth and enhance user experience. Strong track record of cross-functional collaboration to deliver impactful software on time.",
      atsOptimizationTips: [
        "Use standard section headers (Experience, Education, Skills) so ATS parsers can correctly identify your sections.",
        "Remove two-column layouts, images, tables, and headers/footers which confuse older ATS software.",
        "Include your LinkedIn and GitHub URLs in the contact section.",
        "Mirror exact phrasing from the job description in your skills and experience sections.",
        "Save your resume as a text-based PDF — avoid scanned or image-only PDFs.",
        "Use common bullet point characters (•, -, *) rather than custom icons or shapes.",
        "Keep font sizes between 10–12pt and use standard fonts (Arial, Calibri, Times New Roman)."
      ],
      technicalSkillsAnalysis: categorizedSkills
    };

    try {
      const deepAIResult = await analyzeResumeWithAI(rawText, jobDescription);
      if (deepAIResult) {
        aiFeedback = {
          contentQualityScore: deepAIResult.contentQualityScore || contentHeuristics.score,
          suggestions: deepAIResult.suggestions?.length ? deepAIResult.suggestions : contentHeuristics.suggestions,
          weakBullets: deepAIResult.weakBullets?.length ? deepAIResult.weakBullets : aiFeedback.weakBullets,
          extractedKeywords: deepAIResult.extractedKeywords?.length ? deepAIResult.extractedKeywords : aiFeedback.extractedKeywords,
          suggestedKeywords: deepAIResult.suggestedKeywords?.length ? deepAIResult.suggestedKeywords : aiFeedback.suggestedKeywords,
          professionalSummaryRewrite: deepAIResult.professionalSummaryRewrite || aiFeedback.professionalSummaryRewrite,
          atsOptimizationTips: deepAIResult.atsOptimizationTips?.length ? deepAIResult.atsOptimizationTips : aiFeedback.atsOptimizationTips,
          technicalSkillsAnalysis: deepAIResult.technicalSkillsAnalysis || aiFeedback.technicalSkillsAnalysis
        };
      }
    } catch (aiError) {
      console.warn("AI Engine failed, falling back to rule-based and mock AI advice.");
    }

    let improvedResume = cleanedText;
    try {
      const improvementResult = await improveResumeWithAI(rawText, "technical");
      if (improvementResult?.improvedText) {
        improvedResume = improvementResult.improvedText;
      }
    } catch (improveError) {
      console.warn("Improvement AI failed during analysis route:", improveError);
    }

    // 9. Consolidated ATS Score
    const finalATSScore = calculateATSScore({
      keywordScore: keywordAnalysis.score,
      formattingScore: formattingAnalysis.score,
      sectionsScore,
      contentScore: aiFeedback.contentQualityScore
    });

    // 10. Final Verdict
    const finalVerdict = generateFinalVerdict(finalATSScore);

    // 11. Full structured response
    return NextResponse.json({
      status: "success",
      message: "Resume parsed and analyzed successfully.",
      fileName,
      wordCount: rawText.split(/\s+/).length,
      atsScore: finalATSScore,
      finalVerdict,
      cleaned_text: cleanedText,
      improved_resume: improvedResume,
      ats_suggestions: aiFeedback.atsOptimizationTips.slice(0, 6),
      breakdown: {
        keywords: {
          score: keywordAnalysis.score,
          matched: keywordAnalysis.matched,
          missing: keywordAnalysis.missing,
          suggested: aiFeedback.suggestedKeywords
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
          status: sectionsStatus,
          tips: sectionsTips
        },
        content: {
          score: aiFeedback.contentQualityScore,
          suggestions: aiFeedback.suggestions,
          weakBullets: aiFeedback.weakBullets
        },
        skills: {
          categorized: aiFeedback.technicalSkillsAnalysis
        },
        summary: {
          rewrite: aiFeedback.professionalSummaryRewrite
        },
        atsTips: aiFeedback.atsOptimizationTips
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
