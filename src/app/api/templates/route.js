import { NextResponse } from "next/server";
import { PREMIUM_TEMPLATES, FONT_SIZES, FONT_FAMILIES } from "@/lib/templates";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "list") {
      return NextResponse.json({
        templates: PREMIUM_TEMPLATES,
        total: PREMIUM_TEMPLATES.length
      });
    }

    if (action === "fonts") {
      return NextResponse.json({
        sizes: FONT_SIZES,
        families: FONT_FAMILIES
      });
    }

    if (action === "get") {
      const id = searchParams.get("id");
      const template = PREMIUM_TEMPLATES.find(t => t.id === id);
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(template);
    }

    return NextResponse.json({
      templates: PREMIUM_TEMPLATES,
      fonts: { sizes: FONT_SIZES, families: FONT_FAMILIES }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, templateId, customName, customStyles } = body;

    if (action === "preview") {
      const template = PREMIUM_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        ...template,
        customName,
        customStyles: { ...template.styles, ...customStyles }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to process template" },
      { status: 500 }
    );
  }
}
