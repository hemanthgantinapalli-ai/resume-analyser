/**
 * Premium Resume Templates Library
 * 11 professional designs with customizable styling
 */

export const PREMIUM_TEMPLATES = [
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean, minimalist design with bold typography",
    preview: "Modern layout with left sidebar accent",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#6d4aff",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  },
  {
    id: "elegant",
    name: "Elegant Professional",
    description: "Sophisticated design with subtle gradients",
    preview: "Elegant layout with gradient accents",
    styles: {
      bgColor: "#fafafa",
      accentColor: "#1f2937",
      fontFamily: "font-serif",
      fontSize: "text-sm"
    }
  },
  {
    id: "creative",
    name: "Creative Vibrant",
    description: "Bold, colorful design for creative roles",
    preview: "Vibrant layout with colorful sections",
    styles: {
      bgColor: "#f9f7f4",
      accentColor: "#ec4899",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  },
  {
    id: "skillsFirst",
    name: "Skills-First Functional",
    description: "Skills-focused functional design template",
    preview: "Skills-first layout with prominent tech stack",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#1e40af",
      fontFamily: "font-sans",
      fontSize: "text-xs"
    }
  },
  {
    id: "tech",
    name: "Tech Dark",
    description: "Dark mode design for tech professionals",
    preview: "Dark layout with neon accents",
    styles: {
      bgColor: "#0f172a",
      accentColor: "#00d9ff",
      fontFamily: "font-mono",
      fontSize: "text-xs"
    }
  },
  {
    id: "minimalist",
    name: "Ultra Minimalist",
    description: "Extreme minimalism with maximum clarity",
    preview: "Minimal layout with pure typography",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#000000",
      fontFamily: "font-sans",
      fontSize: "text-xs"
    }
  },
  {
    id: "academic",
    name: "Academic Formal",
    description: "Formal academic or research design",
    preview: "Academic layout with structure",
    styles: {
      bgColor: "#fffbf0",
      accentColor: "#92400e",
      fontFamily: "font-serif",
      fontSize: "text-sm"
    }
  },
  {
    id: "startup",
    name: "Startup Fresh",
    description: "Modern startup-friendly design",
    preview: "Startup layout with energetic styling",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#10b981",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  },
  {
    id: "executive",
    name: "Executive Elite",
    description: "Premium executive leadership template",
    preview: "Executive layout with luxury styling",
    styles: {
      bgColor: "#fef5f1",
      accentColor: "#78350f",
      fontFamily: "font-serif",
      fontSize: "text-sm"
    }
  },
  {
    id: "chronological",
    name: "Timeline Chronology",
    description: "Visual timeline-focused design template",
    preview: "Chronological layout with timeline nodes",
    styles: {
      bgColor: "#f3f4f6",
      accentColor: "#d946ef",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  },
  {
    id: "doubleColumn",
    name: "Double Column Dense",
    description: "Balanced two-column design",
    preview: "Double-column layout with balanced sections",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#7c3aed",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  },
  {
    id: "bold",
    name: "Bold Professional",
    description: "High contrast bold design with dark header banner",
    preview: "Bold layout with dark accent header",
    styles: {
      bgColor: "#ffffff",
      accentColor: "#334155",
      fontFamily: "font-sans",
      fontSize: "text-sm"
    }
  }
];

export const FONT_SIZES = [
  { value: "text-[9px]", label: "Small (9px)", size: 9 },
  { value: "text-[10px]", label: "Medium (10px)", size: 10 },
  { value: "text-[11px]", label: "Large (11px)", size: 11 },
  { value: "text-[12px]", label: "Extra Large (12px)", size: 12 }
];

export const FONT_FAMILIES = [
  { value: "font-sans", label: "Sans (Clean)", family: "Inter" },
  { value: "font-serif", label: "Serif (Classic)", family: "Georgia" },
  { value: "font-mono", label: "Monospace (Tech)", family: "Courier" }
];

export const DEFAULT_TEMPLATE_CONFIG = {
  template: "modern",
  fontSize: "text-[10px]",
  fontFamily: "font-sans",
  colorScheme: "light",
  spacing: "compact"
};

export function getTemplateById(id) {
  return PREMIUM_TEMPLATES.find(t => t.id === id);
}

export function getTemplatePreview(templateId) {
  const template = getTemplateById(templateId);
  return template ? template.preview : "Template not found";
}
