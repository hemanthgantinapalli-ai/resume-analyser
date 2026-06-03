import { NextResponse } from "next/server";
import { dbRegisterUser, dbLoginUser } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (action === "register") {
      if (!name) {
        return NextResponse.json({ error: "Name is required for registration" }, { status: 400 });
      }
      
      const user = await dbRegisterUser(name, email, password);
      return NextResponse.json({
        success: true,
        message: "Registration successful",
        user
      });
    } else if (action === "login") {
      const user = await dbLoginUser(email, password);
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'login' or 'register'." }, { status: 400 });
    }

  } catch (error) {
    console.error("Auth API route error:", error);
    return NextResponse.json({ 
      error: error.message || "An authentication error occurred." 
    }, { status: 400 });
  }
}
