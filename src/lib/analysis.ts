// src/lib/analysis.ts

/**
 * Simple utility to extract keywords from a job description.
 * This is a naive implementation: split on non‑word characters,
 * filter out common stopwords, and return unique lower‑cased tokens.
 */
export function extractKeywords(jobDescription: string): string[] {
  const stopwords = new Set([
    "the",
    "and",
    "or",
    "a",
    "an",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "at",
    "by",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "has",
    "have",
    "had",
    "will",
    "shall",
    "may",
    "can",
    "should",
    "must",
    "it",
    "its",
    "that",
    "this",
    "these",
    "those",
    "you",
    "your",
    "we",
    "our",
    "they",
    "their",
  ]);
  const tokens = jobDescription
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !stopwords.has(t));
  return Array.from(new Set(tokens)).sort();
}

/** Detect simple formatting issues that break ATS parsers. */
export function detectFormattingIssues(text: string): string[] {
  const issues: string[] = [];
  // Detect multiple columns / tables (lines with many tabs or many spaces)
  const lines = text.split(/\n/);
  for (const line of lines) {
    if (/\t/.test(line)) {
      issues.push("Tab characters detected – may indicate columns/tables.");
      break;
    }
    // More than 4 consecutive spaces can be a table-like layout
    if (/ {4,}/.test(line)) {
      issues.push("Multiple consecutive spaces detected – possible table layout.");
      break;
    }
  }
  // Detect presence of images (placeholder text)
  if (/\b(image|figure)\b/i.test(text)) {
    issues.push("Reference to images detected – ATS cannot parse images.");
  }
  // Detect uncommon unicode characters
  if (/[^\x00-\x7F]/.test(text)) {
    issues.push("Non‑ASCII characters present – may cause parsing issues.");
  }
  return issues;
}

/** Simple section splitting based on common headings. */
export function analyzeSections(text: string) {
  const sections = [
    "contact",
    "summary",
    "work experience",
    "experience",
    "education",
    "skills",
    "certifications",
  ];
  const result: { section: string; score: number; tip: string }[] = [];
  const lower = text.toLowerCase();
  for (const sec of sections) {
    const present = lower.includes(sec);
    const score = present ? 80 : 20;
    const tip = present
      ? `Good – ${sec} section detected.`
      : `${sec.charAt(0).toUpperCase() + sec.slice(1)} section missing – consider adding it.`;
    result.push({ section: sec, score, tip });
  }
  return result;
}

/** Generate actionable suggestions based on missing keywords and formatting issues. */
export function generateSuggestions(
  text: string,
  missingKeywords: string[],
  formatIssues: string[]
): string[] {
  const suggestions: string[] = [];
  if (missingKeywords.length) {
    suggestions.push(
      `Add the following keywords to improve match: ${missingKeywords
        .slice(0, 8)
        .join(", ")}.
    `
    );
  }
  if (formatIssues.length) {
    suggestions.push(
      `Fix formatting issues: ${formatIssues
        .slice(0, 3)
        .join(", ")}.
    `
    );
  }
  // Add a generic improvement suggestion
  suggestions.push(
    "Include quantified achievements (e.g., " +
      "+30% revenue increase" +
      ") in bullet points where possible."
  );
  return suggestions;
}
