// src/pages/api/improve.js
import nextConnect from "next-connect";
import multer from "multer";
import pdfParse from "pdf-parse";
import clientPromise from "../../../lib/mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

// Simple keyword list for ATS scoring – can be expanded later
const KEYWORDS = [
  "react",
  "next.js",
  "node.js",
  "javascript",
  "typescript",
  "mongodb",
  "express",
  "api",
  "frontend",
  "backend",
  "aws",
  "azure",
  "docker",
  "git",
];

function calculateScore(text) {
  const lower = text.toLowerCase();
  const matches = KEYWORDS.filter((kw) => lower.includes(kw)).length;
  // Simple heuristic: base 50 + 3 points per keyword match (capped at 90)
  return Math.min(50 + matches * 3, 90);
}

async function generateImproved(text) {
  const prompt = `Improve the following resume text, keep the original information, add quantified achievements, and include relevant technical keywords. Return the improved version only:`;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${prompt}\n\n${text}`);
    const response = await result.response;
    return response.text();
  } catch (e) {
    // Fallback simple template if AI fails
    return `Improved Resume:\n\n${text}\n\n[Add quantifiable achievements and keywords]`;
  }
}

apiRoute.post(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = await pdfParse(req.file.buffer);
  const originalText = data.text.trim();

  const score = calculateScore(originalText);
  const improvedText = await generateImproved(originalText);
  const improvedScore = calculateScore(improvedText);

  // Store in MongoDB
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("resumes");
  const doc = {
    userId: req.headers["x-user-id"] || "anonymous",
    originalText,
    improvedText,
    originalScore: score,
    improvedScore,
    createdAt: new Date(),
  };
  await collection.insertOne(doc);

  res.status(200).json({
    originalScore: score,
    improvedScore,
    improvedText,
  });
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default apiRoute;
