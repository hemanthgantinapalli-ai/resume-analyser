import { useState } from "react";
import {
  Layout,
  Type,
  Palette,
  ChevronRight,
  Download,
  Check,
  X,
  Sparkles
} from "lucide-react";

export default function TemplateSelector({
  currentTemplate,
  templates,
  onSelectTemplate,
  fonts,
  currentFontSize,
  currentFontFamily,
  onFontSizeChange,
  onFontFamilyChange
}) {
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  return (
    <div className="space-y-6">
      {/* TEMPLATE SELECTOR HEADER */}
      <div className="glass p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-40" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Template</h3>
              <p className="text-xs text-slate-400">11 Premium Professional Designs</p>
            </div>
          </div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm font-semibold text-purple-400 hover:bg-purple-500/20 transition-all"
          >
            <Layout className="h-4 w-4" />
            <span>{showGrid ? "Hide" : "Show"} All Templates</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* CURRENT TEMPLATE PREVIEW */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Current Selection</p>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{currentTemplate.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{currentTemplate.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-20 rounded-lg bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                {currentTemplate.preview.split(" ").slice(0, 2).join(" ")}
              </div>
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* TEMPLATE GRID */}
      {showGrid && (
        <div className="space-y-4 animate-fade-up">
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Choose from 11 Premium Designs
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl.id);
                  setShowGrid(false);
                }}
                onMouseEnter={() => setHoveredTemplate(tmpl.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`relative group p-3 rounded-xl border-2 transition-all ${
                  currentTemplate.id === tmpl.id
                    ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-slate-700 bg-slate-900/50 hover:border-purple-400 hover:bg-slate-800"
                }`}
              >
                {/* Template Preview Box */}
                <div className={`w-full h-24 rounded-lg mb-2 flex items-center justify-center text-center text-[10px] font-mono transition-all ${
                  tmpl.id === "tech" ? "bg-slate-950 text-cyan-400" : "bg-linear-to-br from-slate-700 to-slate-800 text-slate-300"
                }`}>
                  {tmpl.preview}
                </div>

                {/* Template Name */}
                <h4 className="text-xs font-bold text-white text-left">{tmpl.name}</h4>
                <p className="text-[10px] text-slate-400 text-left leading-tight mt-0.5 line-clamp-2">
                  {tmpl.description}
                </p>

                {/* Active Indicator */}
                {currentTemplate.id === tmpl.id && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FONT AND STYLING CONTROLS */}
      <div className="glass p-6 rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-40" />

        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-blue-400" />
          Customize Fonts & Sizing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Font Size */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Font Size</label>
            <div className="grid grid-cols-2 gap-2">
              {fonts.sizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => onFontSizeChange(size.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    currentFontSize === size.value
                      ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20"
                      : "bg-slate-900/50 text-slate-300 border-slate-700 hover:border-blue-400 hover:bg-slate-800"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Font Style</label>
            <div className="grid grid-cols-3 gap-2">
              {fonts.families.map((family) => (
                <button
                  key={family.value}
                  onClick={() => onFontFamilyChange(family.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    currentFontFamily === family.value
                      ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20"
                      : "bg-slate-900/50 text-slate-300 border-slate-700 hover:border-blue-400 hover:bg-slate-800"
                  }`}
                >
                  {family.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">
              Preview: <span className={fonts.families.find(f => f.value === currentFontFamily)?.value || "font-sans"}>{fonts.families.find(f => f.value === currentFontFamily)?.label}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
