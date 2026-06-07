// Rule-Based ATS Analysis Engine

// Predefined industry standard keywords for general technical/soft-skills fallback
export const DEFAULT_KEYWORDS = [
  "react", "node.js", "javascript", "typescript", "python", "java", "html", "css",
  "sql", "mongodb", "aws", "docker", "git", "rest api", "kubernetes", "agile",
  "scrum", "ci/cd", "c++", "linux", "cloud", "testing", "optimization",
  "project management", "communication", "problem solving", "analytics", "collaboration"
];

// List of action verbs highly favored by ATS systems
export const ACTION_VERBS = [
  "designed", "developed", "implemented", "optimized", "engineered", "launched",
  "led", "managed", "increased", "decreased", "reduced", "maximized", "accelerated",
  "created", "built", "spearheaded", "revamped", "saved", "generated", "solved"
];

/**
 * Parses resume text line by line to extract and categorize sections.
 * @param {string} text 
 * @returns {object} Sections and their extracted content
 */
export function detectSections(text) {
  const sections = {
    skills: "",
    experience: "",
    projects: "",
    education: "",
    contact: "",
    summary: "",
    other: ""
  };

  if (!text) return sections;

  const lines = text.split(/\r?\n/);
  let currentSection = "other";

  const SECTION_KEYWORDS = {
    skills: /^(technical\s+)?(skills|technologies|competencies|expertise|tools|languages)/i,
    experience: /^(work\s+)?experience|employment|professional\s+history|career/i,
    projects: /^projects|personal\s+projects|key\s+projects|academic\s+projects/i,
    education: /^education|academic\s+background|credentials|degrees|qualifications/i,
    summary: /^summary|professional\s+summary|about\s+me|profile|objective/i,
    contact: /^contact|personal\s+info|address|links/i
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if the trimmed line is a section header (usually short and matches keywords)
    let headerDetected = false;
    if (trimmed.length < 40) {
      for (const [secKey, regex] of Object.entries(SECTION_KEYWORDS)) {
        if (regex.test(trimmed)) {
          currentSection = secKey;
          headerDetected = true;
          break;
        }
      }
    }

    if (!headerDetected) {
      // Append text to the active section
      sections[currentSection] += line + "\n";
    }
  }

  // Fallback contact detection (if no explicit contact section, search at the top)
  if (!sections.contact && lines.length > 0) {
    // Take first 10 lines and check if they contain email/phone
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/;
    
    let contactLines = [];
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      if (emailRegex.test(lines[i]) || phoneRegex.test(lines[i]) || lines[i].includes("http") || lines[i].includes("github.com")) {
        contactLines.push(lines[i]);
      }
    }
    if (contactLines.length > 0) {
      sections.contact = contactLines.join("\n");
    }
  }

  return sections;
}

/**
 * Runs rule-based checks on formatting and content heuristics
 * @param {string} rawText 
 * @param {object} sections 
 * @returns {object} Formatting check results
 */
export function checkFormatting(rawText, sections) {
  const result = {
    score: 100,
    hasEmail: false,
    hasPhone: false,
    hasLinks: false,
    wordCount: 0,
    bulletPointsCount: 0,
    bulletPointsScore: 0,
    lengthFeedback: "",
    formattingIssues: []
  };

  if (!rawText) return result;

  // 1. Contact checks
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/;
  const linkRegex = /github\.com|linkedin\.com|http|www\./i;

  result.hasEmail = emailRegex.test(rawText);
  result.hasPhone = phoneRegex.test(rawText);
  result.hasLinks = linkRegex.test(rawText);

  if (!result.hasEmail) {
    result.score -= 15;
    result.formattingIssues.push("Missing email address. Make sure your contact details are clear.");
  }
  if (!result.hasPhone) {
    result.score -= 15;
    result.formattingIssues.push("Missing phone number. Recruiters need a way to reach you.");
  }
  if (!result.hasLinks) {
    result.score -= 5;
    result.formattingIssues.push("No GitHub or LinkedIn profile links detected. Include portfolios to stand out.");
  }

  // 2. Word Count check (Ideal: 200 - 600 words)
  const words = rawText.split(/\s+/).filter(w => w.length > 0);
  result.wordCount = words.length;

  if (result.wordCount < 150) {
    result.score -= 15;
    result.lengthFeedback = "Resume is very short. Expand on your professional accomplishments and experience.";
    result.formattingIssues.push(`Word count is too low (${result.wordCount} words). Add detailed project descriptions.`);
  } else if (result.wordCount > 1000) {
    result.score -= 15;
    result.lengthFeedback = "Resume is extremely long. Keep your content concise and stick to a maximum of 2 pages.";
    result.formattingIssues.push(`Resume is too wordy (${result.wordCount} words). Condense summaries and remove redundancies.`);
  } else if (result.wordCount > 600) {
    result.score -= 5;
    result.lengthFeedback = "Resume is slightly long. Try to condense it into a single high-impact page.";
  } else {
    result.lengthFeedback = "Optimal length! Perfect balance of depth and conciseness.";
  }

  // 3. Bullet Point check (ATS prefers bullet points in Experience and Projects)
  // Count lines starting with bullet chars: -, *, •, ▪, ◦, 1., etc.
  const lines = rawText.split(/\r?\n/);
  const bulletRegex = /^[\s\t]*([-*•▪◦]|\d+\.)/;
  
  let bulletCount = 0;
  for (let line of lines) {
    if (bulletRegex.test(line)) {
      bulletCount++;
    }
  }
  result.bulletPointsCount = bulletCount;

  if (bulletCount === 0) {
    result.score -= 20;
    result.formattingIssues.push("No bullet points detected. ATS scanners read bulleted lists much better than raw paragraphs.");
  } else if (bulletCount < 5) {
    result.score -= 10;
    result.formattingIssues.push("Too few bullet points. Structure your experience and project achievements with bulleted lists.");
  }

  // Capping formatting score at 0
  result.score = Math.max(0, result.score);
  return result;
}

/**
 * Calculates keyword match percentages
 * @param {string} rawText 
 * @param {Array<string>} targetKeywords 
 * @returns {object} Keywords matched, missing, and match score
 */
export function calculateKeywordMatch(rawText, targetKeywords = []) {
  if (!rawText) {
    return {
      score: 0,
      matched: [],
      missing: targetKeywords
    };
  }

  const keywords = targetKeywords.length > 0 ? targetKeywords : DEFAULT_KEYWORDS;
  const textLower = rawText.toLowerCase();
  
  const matched = [];
  const missing = [];

  keywords.forEach(keyword => {
    // Create a boundary safe regex to check for keyword occurrence
    // Escape regex characters
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    if (regex.test(textLower)) {
      matched.push(keyword);
    } else {
      // Also do a simple string match as a backup (e.g. for keywords with dots like Node.js)
      if (textLower.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  });

  const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 100;

  return {
    score,
    matched,
    missing
  };
}

/**
 * Evaluates text quality using action verb counts and numbers (quantifiable metrics)
 * @param {string} rawText 
 * @returns {object} Quality metrics and local score proxy
 */
export function evaluateContentHeuristics(rawText) {
  if (!rawText) return { score: 0, verbCount: 0, metricCount: 0, suggestions: [] };

  const textLower = rawText.toLowerCase();
  const suggestions = [];

  // Count action verbs
  let verbCount = 0;
  const foundVerbs = [];
  ACTION_VERBS.forEach(verb => {
    if (textLower.includes(verb)) {
      verbCount++;
      foundVerbs.push(verb);
    }
  });

  // Count numbers (metrics/percentages: e.g. "50%", "10,000", "$5k", "2x")
  const metricRegex = /(\d+%\s+|\d+x\b|\$\d+|\d+\s*percent|\b(million|thousand)\b)/gi;
  const metricsMatched = rawText.match(metricRegex) || [];
  const metricCount = metricsMatched.length;

  let score = 50; // Base score
  
  // Scoring additions
  score += Math.min(25, verbCount * 5); // 5 points per verb, cap at 25
  score += Math.min(25, metricCount * 8); // 8 points per quantitative metric, cap at 25

  if (verbCount < 3) {
    suggestions.push("Use more high-impact action verbs (e.g., 'spearheaded', 'optimized', 'engineered') at the start of your bullet points.");
  }
  if (metricCount < 2) {
    suggestions.push("Quantify your achievements! Add metrics, percentages, dollar values, or scale numbers to show measurable business impact.");
  }

  return {
    score: Math.min(100, score),
    verbCount,
    metricCount,
    suggestions
  };
}

/**
 * Calculates consolidated ATS score
 */
export function calculateATSScore({ keywordScore, formattingScore, sectionsScore, contentScore }) {
  const score = Math.round(
    (keywordScore * 0.4) +
    (formattingScore * 0.2) +
    (sectionsScore * 0.2) +
    (contentScore * 0.2)
  );
  return Math.min(100, Math.max(0, score));
}

/**
 * Categorizes a list of skills into Frontend, Backend, and Tools.
 * @param {Array<string>} skills
 * @returns {object} Categorized skills
 */
export function categorizeSkills(skills = []) {
  const categories = {
    frontend: [],
    backend: [],
    tools: []
  };

  const frontendKeywords = ["react", "vue", "angular", "html", "css", "tailwind", "next.js", "bootstrap", "javascript", "typescript", "sass", "less", "redux", "graphql"];
  const backendKeywords = ["node.js", "express", "python", "django", "flask", "java", "spring", "c++", "c#", ".net", "php", "laravel", "ruby", "rails", "sql", "mongodb", "postgresql", "mysql", "redis", "rest api", "fastapi", "golang", "go", "rust"];
  const toolKeywords = ["aws", "docker", "kubernetes", "git", "ci/cd", "linux", "cloud", "azure", "gcp", "agile", "scrum", "testing", "jest", "cypress", "webpack", "babel", "npm", "yarn", "github", "gitlab", "bitbucket", "jira"];

  skills.forEach(skill => {
    const sLower = skill.toLowerCase();
    
    // Check if it belongs to any predefined category
    if (frontendKeywords.some(kw => sLower.includes(kw))) {
      categories.frontend.push(skill);
    } else if (backendKeywords.some(kw => sLower.includes(kw))) {
      categories.backend.push(skill);
    } else if (toolKeywords.some(kw => sLower.includes(kw))) {
      categories.tools.push(skill);
    } else {
      // Default to tools if unsure, or you could add an 'other' category. 
      // Many ambiguous tech skills fall under tools/platforms.
      categories.tools.push(skill);
    }
  });

  return categories;
}

/**
 * Generates a final verdict based on the overall ATS score.
 * @param {number} score 
 * @returns {object} Final verdict with rating and summary
 */
export function generateFinalVerdict(score) {
  if (score >= 80) {
    return {
      rating: "Excellent",
      summary: "Your resume is highly optimized and ready for top-tier tech applications. It has strong ATS compliance and impactful phrasing."
    };
  } else if (score >= 60) {
    return {
      rating: "Good",
      summary: "Your resume is solid but has room for improvement. Focus on quantifying achievements and ensuring all missing keywords are addressed."
    };
  } else if (score >= 40) {
    return {
      rating: "Average",
      summary: "Your resume may struggle against strict ATS filters. Address formatting issues, add missing sections, and rewrite weak bullet points."
    };
  } else {
    return {
      rating: "Poor",
      summary: "Your resume needs significant revision. Please utilize our Smart Builder or AI Improver to rebuild your resume structure and content."
    };
  }
}
