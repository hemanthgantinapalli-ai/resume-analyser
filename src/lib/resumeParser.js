import mammoth from "mammoth";
import { detectSections } from "./atsEngine.js";

const PDF_SOURCE_INDICATORS = [
  "%PDF-",
  "endobj",
  "endstream",
  "/Type/Page",
  "0 obj",
  "/Font",
  "/MediaBox",
  "/Contents",
  "/Length"
];

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/;
const urlRegex = /(https?:\/\/|www\.)/i;

export function normalizeReadableText(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\u2028\u2029]/g, " ");
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return cleaned.trim();
}

export function looksLikePdfSource(text) {
  if (!text || typeof text !== "string") return false;
  const matchCount = PDF_SOURCE_INDICATORS.filter((indicator) => text.includes(indicator)).length;
  return matchCount >= 2;
}

export function extractReadableTextFromPdfSource(raw) {
  if (!raw || typeof raw !== "string") return "";
  const textSegments = [];

  const tjRegex = /\(([^\\)]*(?:\\.[^\\)]*)*)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(raw)) !== null) {
    const text = match[1].replace(/\\([\\nrtbf()])/g, "$1");
    if (text && text.trim()) textSegments.push(text.trim());
  }

  const tjArrayRegex = /\[((?:\([^\\)]*(?:\\.[^\\)]*)*\)\s*)+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(raw)) !== null) {
    const group = match[1];
    const innerMatches = [...group.matchAll(/\(([^\\)]*(?:\\.[^\\)]*)*)\)/g)];
    innerMatches.forEach((inner) => {
      const text = inner[1].replace(/\\([\\nrtbf()])/g, "$1");
      if (text && text.trim()) textSegments.push(text.trim());
    });
  }

  return normalizeReadableText(textSegments.join("\n"));
}

export function extractCandidateName(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  for (const line of lines) {
    if (emailRegex.test(line) || phoneRegex.test(line) || urlRegex.test(line)) continue;
    if (line.split(/\s+/).length > 5) continue;
    if (!/[A-Za-z]/.test(line)) continue;
    return line;
  }

  return lines.length ? lines[0] : "";
}

export function buildStructuredResumeText(rawText) {
  const sections = detectSections(rawText);
  const parts = [];
  const name = extractCandidateName(rawText);

  if (name) {
    parts.push(`Name:\n${name}`);
  }

  if (sections.contact) {
    parts.push(`Contact Information:\n${normalizeReadableText(sections.contact)}`);
  }

  if (sections.summary) {
    parts.push(`Summary:\n${normalizeReadableText(sections.summary)}`);
  }

  if (sections.skills) {
    parts.push(`Skills:\n${normalizeReadableText(sections.skills)}`);
  }

  if (sections.experience) {
    parts.push(`Experience:\n${normalizeReadableText(sections.experience)}`);
  }

  if (sections.projects) {
    parts.push(`Projects:\n${normalizeReadableText(sections.projects)}`);
  }

  if (sections.education) {
    parts.push(`Education:\n${normalizeReadableText(sections.education)}`);
  }

  if (!parts.length) {
    return normalizeReadableText(rawText);
  }

  return parts.join("\n\n");
}

export async function parseResumeBuffer(fileBuffer, fileName) {
  const fileExtension = (fileName || "").split(".").pop().toLowerCase();
  let rawText = "";
  let parseError = null;

  try {
    if (fileExtension === "pdf") {
      let parsedText = "";
      try {
        const pdfParse = (await import("pdf-parse")).default || (await import("pdf-parse"));
        const pdfResult = await pdfParse(fileBuffer);
        parsedText = pdfResult?.text || "";
      } catch (pdfError) {
        parseError = pdfError;
      }

      rawText = normalizeReadableText(parsedText);

      if (!rawText) {
        const fallbackText = extractReadableTextFromPdfSource(fileBuffer.toString("latin1"));
        rawText = normalizeReadableText(fallbackText);
      }
    } else if (fileExtension === "docx") {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = normalizeReadableText(parsed?.value || "");
    } else {
      rawText = normalizeReadableText(fileBuffer.toString("utf8"));
      if (!rawText) {
        rawText = normalizeReadableText(fileBuffer.toString("latin1"));
      }
    }
  } catch (error) {
    parseError = error;
  }

  if (!rawText || looksLikePdfSource(rawText)) {
    return {
      rawText: "",
      fileExtension,
      error: "Unable to extract readable resume content. Please upload a proper text-based PDF."
    };
  }

  return {
    rawText,
    fileExtension,
    error: parseError ? parseError.message : null
  };
}
