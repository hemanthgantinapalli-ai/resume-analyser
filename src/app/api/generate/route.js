import { NextResponse } from "next/server";
import { generateResumeWithAI } from "@/lib/aiEngine";

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.name || !body.skills) {
      return NextResponse.json({ 
        error: "Missing required fields. Name and Skills are mandatory to bootstrap a resume." 
      }, { status: 400 });
    }

    console.log("Generating AI Resume for:", body.name);

    // Call the AI client engine (handles Gemini generation or triggers mock fallback)
    const generatedData = await generateResumeWithAI(body);

    return NextResponse.json({
      success: true,
      name: body.name,
      contact: {
        email: body.email || "",
        phone: body.phone || "",
        links: body.links || ""
      },
      summary: generatedData.summary,
      skills: generatedData.skills,
      experience: generatedData.experience,
      projects: generatedData.projects,
      education: body.education || []
    });

  } catch (error) {
    console.error("Resume generation API route crash:", error);
    return NextResponse.json({ 
      error: "An internal server error occurred while generating the resume: " + error.message 
    }, { status: 500 });
  }
}
