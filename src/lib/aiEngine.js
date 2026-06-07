import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
let aiClient = null;

// Initialize GoogleGenerativeAI client if API key is provided
if (API_KEY) {
  try {
    aiClient = new GoogleGenerativeAI(API_KEY);
    console.log("Gemini AI Client initialized successfully.");
  } catch (error) {
    console.error("Error initializing Gemini AI Client:", error);
  }
} else {
  console.warn("No GEMINI_API_KEY found. Running in high-fidelity MOCK AI MODE.");
}

/**
 * AI Analysis Layer - Evaluates quality of text and detects weak bullet points.
 */
export async function analyzeResumeWithAI(resumeText, jobDescription = "") {
  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an expert recruiter and ATS (Applicant Tracking System) optimization engine.
        Analyze the following resume text${jobDescription ? " in relation to this job description: " + jobDescription : ""}.
        
        Provide highly professional, specific, and actionable suggestions.
        Focus on weak statements that lack quantitative metrics, passive phrasing, or generic skills.
        
        Return ONLY a JSON object matching this exact TypeScript interface (do not include markdown code block formatting in your response, just the raw JSON):
        interface AnalysisResponse {
          contentQualityScore: number; // 0-100 rating of bullet point quality and action verbs
          suggestions: string[]; // 4-6 specific actionable ideas to improve
          weakBullets: Array<{
            original: string; // The weak bullet point identified in the resume
            improved: string; // A re-written high-impact version with action verbs and metrics placeholders
            reason: string; // Why it was weak (e.g. passive, no numbers)
          }>;
          extractedKeywords: string[]; // Technical tools/skills found in the text
          suggestedKeywords: string[]; // Skills missing from the resume that would boost ATS scoring
          professionalSummaryRewrite: string; // A strong, concise 3-4 line professional summary based on the resume
          atsOptimizationTips: string[]; // 5-7 actionable ATS improvements
          technicalSkillsAnalysis: {
            frontend: string[];
            backend: string[];
            tools: string[];
          };
        }

        Resume Text:
        ${resumeText}
      `;
      
      const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
      const responseText = result.response.text().trim();
      
      // Attempt to clean JSON markdown wrappers if returned
      const cleanJson = responseText.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini API call failed, falling back to mock:", e);
    }
  }

  // MOCK AI FALLBACK ENGINE (High Fidelity)
  return getMockAnalysis(resumeText, jobDescription);
}

/**
 * AI Resume Generation - Crafts tailored summaries and bullets from user forms.
 */
export async function generateResumeWithAI(formData) {
  const { name, summary, skills, experience, projects, education } = formData;

  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an expert professional resume writer. Generate an ultra-professional, ATS-optimized resume based on these inputs.
        Structure the experience and project accomplishments to use powerful action verbs, quantitative metrics (e.g., %, $, time saved), and clear technical skill references.
        
        Return ONLY a JSON object matching this exact structure (no markdown wrappers, just raw JSON):
        {
          "summary": "AI generated high-impact professional summary paragraph",
          "experience": [
            {
              "company": "Company Name",
              "role": "Role Title",
              "duration": "Duration (e.g. 2022 - Present)",
              "bullets": [
                "High impact bullet point starting with action verb and including a quantitative metric",
                "Another powerful bullet point showing project scaling or business value"
              ]
            }
          ],
          "projects": [
            {
              "title": "Project Title",
              "technologies": ["React", "Node.js"],
              "bullets": [
                "Optimized database performance by 40% using advanced index strategies",
                "Deployed React interface resulting in 15% increase in user retention"
              ]
            }
          ],
          "skills": ["Skill1", "Skill2", "Skill3"]
        }

        Inputs:
        Name: ${name}
        Original Summary Request: ${summary || "Create a modern resume summary"}
        Skills: ${skills}
        Experience Details: ${JSON.stringify(experience)}
        Project Details: ${JSON.stringify(projects)}
        Education Details: ${JSON.stringify(education)}
      `;

      const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini API generation failed, falling back to mock:", e);
    }
  }

  // MOCK AI GENERATION FALLBACK
  return getMockGeneration(formData);
}

/**
 * AI Resume Improver - Rewrites experience bullets for high impact.
 */
export async function improveResumeWithAI(resumeText, targetTone = "technical") {
  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an elite executive resume writer. Rewrite the following resume text to target a ${targetTone} focus.
        Elevate every experience description and project bullet. Inject powerful action verbs, eliminate generic descriptors, and format all achievements to follow the STAR methodology (Situation, Task, Action, Result) with measurable metrics.
        
        Return ONLY a JSON object matching this exact structure (no markdown wrappers, just raw JSON):
        {
          "improvedText": "Full text of the completely improved and rewritten resume, retaining headers but optimizing content...",
          "scoreDelta": 18, // Estimated ATS score increase out of 100
          "changes": [
            {
              "original": "Original weak phrase/sentence from the resume",
              "improved": "Fully rewritten high-impact sentence with metrics and action verbs",
              "explanation": "Why this change makes the resume stronger (e.g. converted passive task to metric-driven achievement)"
            }
          ]
        }

        Resume Text:
        ${resumeText}
      `;

      const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini API rewriting failed, falling back to mock:", e);
    }
  }

  // MOCK AI IMPROVEMENT FALLBACK
  return getMockImprovement(resumeText, targetTone);
}

// ============================================================================
// HIGH-FIDELITY MOCK AI ENGINES
// ============================================================================

function getMockAnalysis(text, jobDesc = "") {
  const textLower = text.toLowerCase();
  
  // Custom keyword scanner
  const mockKeywords = ["react", "node.js", "python", "aws", "docker", "kubernetes", "typescript", "mongodb", "sql"];
  const foundKeywords = [];
  const missingKeywords = [];
  
  mockKeywords.forEach(kw => {
    if (textLower.includes(kw)) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  if (jobDesc) {
    // Add job specific keywords to missing if not in resume
    const jdLower = jobDesc.toLowerCase();
    const standardSkills = ["next.js", "tailwindcss", "express", "graphql", "redis", "ci/cd", "microservices"];
    standardSkills.forEach(skill => {
      if (jdLower.includes(skill) && !textLower.includes(skill) && !missingKeywords.includes(skill)) {
        missingKeywords.push(skill);
      }
    });
  }

  // Identify fake weak bullets based on common phrases
  const weakBullets = [];
  const bulletMatches = text.match(/^[•\-\*]\s*(.+)$/gm) || [];
  
  let addedWeakBullets = 0;
  bulletMatches.forEach(b => {
    const rawBullet = b.replace(/^[•\-\*]\s*/, "").trim();
    if (rawBullet.length > 5 && addedWeakBullets < 3) {
      const lower = rawBullet.toLowerCase();
      // Heuristic: bullet is weak if it is short or does not contain numbers/verbs
      if (lower.includes("responsible for") || lower.includes("worked on") || lower.length < 50 || !/\d+/.test(rawBullet)) {
        let improved = `Spearheaded delivery of primary features, accelerating project timelines by 25% and integrating modern workflows (like ${missingKeywords[0] || "React"}) that scaled concurrent user support to 10k+.`;
        let reason = "Uses passive phrasing like 'responsible for' or lacks measurable impact numbers (quantifiable metrics).";
        
        if (lower.includes("worked on")) {
          improved = `Engineered and optimized core database modules, resulting in a 40% reduction in response latency for over 50,000 active daily users.`;
          reason = "Vague verb choice ('worked on'). Replaced with an action verb ('engineered') and added direct metrics.";
        }
        
        weakBullets.push({
          original: rawBullet,
          improved,
          reason
        });
        addedWeakBullets++;
      }
    }
  });

  // Default weak bullets if none found
  if (weakBullets.length === 0) {
    weakBullets.push({
      original: "Responsible for managing the team and talking to stakeholders.",
      improved: "Orchestrated cross-functional collaboration across a team of 6 engineers, accelerating sprint deliverables by 20% and leading regular stakeholder strategy alignments.",
      reason: "Lacks strong action verbs and quantitative metrics. Passive framing 'responsible for' should be active."
    });
    weakBullets.push({
      original: "Worked on fixing bugs and writing React code.",
      improved: "Refactored legacy React architectures and solved 50+ critical performance bottlenecks, yielding a 15% boost in client-side load efficiency.",
      reason: "Passive verb usage 'worked on fixing'. Quantify achievements with metrics and specify tools used."
    });
  }

  // Pre-determined recommendations
  const suggestions = [
    "Quantify your accomplishments! Recruiters want to see percentages, numbers, and dollar values (e.g., 'reduced page load time by 30%').",
    "Replace passive phrases like 'responsible for' or 'helped with' with authoritative action verbs (e.g., 'spearheaded', 'orchestrated', 'engineered').",
    `Add technical skills identified as missing: ${missingKeywords.slice(0, 3).join(", ") || "Next.js, CI/CD"}.`,
    "Improve your professional summary to highlight your years of experience, core tech stack, and primary value proposition clearly.",
    "Structure your experience section chronologically and keep descriptions focused on achievements rather than day-to-day duties."
  ];

  const atsOptimizationTips = [
    "Ensure standard section headers like 'Experience' and 'Education' are used so ATS parsers can read them.",
    "Remove two-column layouts, images, and complex tables which can confuse older ATS software.",
    "Include your LinkedIn and GitHub URLs in the contact section.",
    "Tailor your skills section to mirror the exact phrasing used in the job description.",
    "Save and upload your final resume as a standard PDF to preserve formatting, unless DOCX is explicitly requested."
  ];

  const professionalSummaryRewrite = "Results-driven Software Engineer with proven experience in architecting scalable solutions and optimizing system performance. Adept at leveraging modern web technologies to drive business growth and enhance user experience. Strong track record of cross-functional collaboration to deliver impactful software on time.";

  const technicalSkillsAnalysis = {
    frontend: foundKeywords.filter(k => ["react", "vue", "angular", "html", "css", "javascript", "typescript"].includes(k)),
    backend: foundKeywords.filter(k => ["node.js", "python", "sql", "mongodb"].includes(k)),
    tools: foundKeywords.filter(k => ["aws", "docker", "kubernetes", "git"].includes(k))
  };

  const qualityScore = Math.min(92, Math.max(55, 60 + foundKeywords.length * 4 - weakBullets.length * 5));

  return {
    contentQualityScore: qualityScore,
    suggestions,
    weakBullets,
    extractedKeywords: foundKeywords.length > 0 ? foundKeywords : ["javascript", "html", "css", "git"],
    suggestedKeywords: missingKeywords.length > 0 ? missingKeywords : ["next.js", "tailwindcss", "ci/cd"],
    professionalSummaryRewrite,
    atsOptimizationTips,
    technicalSkillsAnalysis
  };
}

function getMockGeneration(formData) {
  const skillsArray = formData.skills ? formData.skills.split(",").map(s => s.trim()) : ["JavaScript", "React", "Node.js"];
  
  const experience = formData.experience || [
    { company: "Global Tech Inc", role: "Software Engineer", duration: "2023 - Present" }
  ];
  
  const projects = formData.projects || [
    { title: "E-Commerce Microservices", technologies: ["Node.js", "Express", "Docker"] }
  ];

  const improvedExp = experience.map(exp => ({
    company: exp.company || "Innovative Solutions",
    role: exp.role || "Full Stack Developer",
    duration: exp.duration || "2022 - Present",
    bullets: [
      `Spearheaded the design and deployment of highly responsive web applications utilizing ${skillsArray[0] || "React"}, accelerating feature delivery cycles by 30%.`,
      `Engineered robust server architectures, improving system fault tolerance and scaling database read/write speeds by 45%.`,
      `Collaborated inside an Agile team to optimize client-side interactions, contributing to a 12% increase in active user retention.`
    ]
  }));

  const improvedProj = projects.map(proj => ({
    title: proj.title || "Enterprise Scalability Platform",
    technologies: proj.technologies && proj.technologies.length > 0 ? proj.technologies : [skillsArray[0] || "React", skillsArray[1] || "Node.js"],
    bullets: [
      `Architected high-performance pipelines, processing 1M+ weekly requests with minimal resource overhead.`,
      `Implemented comprehensive CI/CD deployment routines, reducing software production bug rates by 22%.`
    ]
  }));

  return {
    summary: formData.summary || `Result-oriented Software professional with a strong track record of engineering scalable, user-centric systems using ${skillsArray.slice(0, 3).join(", ") || "React & Node"}. Proven ability to combine technical mastery with business acumen to optimize performance metrics and drive growth.`,
    experience: improvedExp,
    projects: improvedProj,
    skills: skillsArray
  };
}

function getMockImprovement(text, tone) {
  const mockChanges = [
    {
      original: "Helped write the company website using Node.js.",
      improved: "Engineered and deployed the primary company application in Node.js, yielding a 35% performance improvement in network payload response.",
      explanation: "Replaced weak, collaborative framing ('helped write') with absolute ownership ('engineered and deployed') and defined a quantifiable performance result."
    },
    {
      original: "Responsible for database maintenance and backups.",
      improved: "Orchestrated comprehensive PostgreSQL database migrations, auditing security protocols and maintaining 99.98% database availability.",
      explanation: "Elevated a basic operational chore into an executive achievement highlighting structural reliability and architecture uptime."
    },
    {
      original: "Fixed CSS styling bugs to make pages look nicer.",
      improved: "Refactored user-interface components, eliminating 40+ interface design anomalies to elevate UX metrics by 15%.",
      explanation: "Translated visual corrections into high-level user experience optimization, making the action sound significantly more technical and professional."
    }
  ];

  // Modify text using regex to replace typical phrases
  let improvedText = text;
  mockChanges.forEach(change => {
    improvedText = improvedText.replace(change.original, change.improved);
  });

  // If text is not matching exactly, append or interpolate
  if (improvedText === text) {
    improvedText = `
[PROPOSED OPTIMIZATION: FOR ${tone.toUpperCase()} FOCUS]

PROFESSIONAL SUMMARY
Dynamic engineer with proven expertise in orchestrating highly scaled system architectures and leading feature deliveries. Specialized in driving operational efficiencies and executing metrics-focused software improvements.

TECHNICAL EXPERIENCE
- Spearheaded core microservices engineering, accelerating load processes by 40% and optimizing data pipelines.
- Orchestrated comprehensive system audits, eliminating 25+ critical bottlenecks to guarantee 99.9% application uptime.
- Refactored legacy UI components, boosting customer engagement indices by 18%.

PROJECT accomplishments
- Architected enterprise cloud deployments, reducing operational hosting budgets by 25% while maintaining strict data compliance.
    `;
  }

  return {
    improvedText,
    scoreDelta: 16,
    changes: mockChanges
  };
}
