import { NextResponse } from "next/server";
import { improveResumeWithAI } from "@/lib/aiEngine";

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, tone } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ 
        error: "Missing resume text to optimize." 
      }, { status: 400 });
    }

    const targetTone = tone || "technical";
    console.log(`Improving resume with tone: ${targetTone}`);

    // Call the AI client engine to get improved text and changes log
    const result = await improveResumeWithAI(text, targetTone);

    return NextResponse.json({
      success: true,
      improvedText: result.improvedText,
      scoreDelta: result.scoreDelta || 15,
      changes: result.changes || []
    });

  } catch (error) {
    console.error("Resume improvement API route crash:", error);
    return NextResponse.json({ 
      error: "An internal server error occurred while improving the resume: " + error.message 
    }, { status: 500 });
  }
}
