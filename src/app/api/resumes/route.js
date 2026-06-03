import { NextResponse } from "next/server";
import { 
  dbSaveResume, 
  dbGetUserResumes, 
  dbGetResumeById, 
  dbSaveHistory, 
  dbGetResumeHistory 
} from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const resumeId = searchParams.get("id");
    const getHistory = searchParams.get("history") === "true";

    // 1. Fetch single resume details
    if (resumeId) {
      if (getHistory) {
        const historyList = await dbGetResumeHistory(resumeId);
        return NextResponse.json({ success: true, history: historyList });
      } else {
        const resume = await dbGetResumeById(resumeId);
        return NextResponse.json({ success: true, resume });
      }
    }

    // 2. Fetch list of resumes for user
    if (userId) {
      const resumes = await dbGetUserResumes(userId);
      return NextResponse.json({ success: true, resumes });
    }

    return NextResponse.json({ error: "Missing required query parameters (userId or id)" }, { status: 400 });

  } catch (error) {
    console.error("Resumes GET API route error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to retrieve resume data." 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeId, userId, title, rawText, structuredData, templateId, atsScore, changesDescription } = body;

    // 1. Save new version to history of existing resume
    if (resumeId) {
      if (!changesDescription) {
        return NextResponse.json({ error: "Changes description is required for updates" }, { status: 400 });
      }
      
      const newHistory = await dbSaveHistory({
        resumeId,
        changesDescription,
        content: rawText,
        score: atsScore || 0
      });
      
      return NextResponse.json({
        success: true,
        message: "Version saved successfully",
        history: newHistory
      });
    }

    // 2. Create brand new resume record
    if (!userId || !title) {
      return NextResponse.json({ error: "userId and title are required to create a resume" }, { status: 400 });
    }

    const newResume = await dbSaveResume({
      userId,
      title,
      rawText: rawText || "",
      structuredData: structuredData || {},
      templateId: templateId || "modern",
      atsScore: atsScore || 0
    });

    return NextResponse.json({
      success: true,
      message: "Resume saved successfully",
      resume: newResume
    });

  } catch (error) {
    console.error("Resumes POST API route error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to save resume data." 
    }, { status: 500 });
  }
}
