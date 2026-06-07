"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import confetti from "canvas-confetti";
import { 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSearch,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  Award,
  ChevronRight,
  HelpCircle,
  Zap,
  Heart,
  Target,
  Code2,
  Lightbulb,
  User
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    const savedResult = window.localStorage.getItem("ai_resume_analysis");
    return savedResult ? JSON.parse(savedResult) : null;
  });
  const [targetJd, setTargetJd] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("ai_resume_target_jd") || "";
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedId, setCopiedId] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 60 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 } });
    }, 250);
  };

  useEffect(() => {
    if (data?.atsScore >= 80) {
      triggerConfetti();
    }
  }, [data]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Empty State
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a0f] relative overflow-hidden">
        <div className="noise-overlay" />
        <Navbar />
        <main className="grow flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-10 text-center max-w-md w-full shadow-2xl animate-fade-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6d4aff]/10 border border-[#6d4aff]/20 text-[#a78bfa] mb-5">
              <FileSearch className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">No Report Found</h2>
            <p className="text-sm text-[#8e8ea8] mb-6 leading-relaxed">
              You haven&apos;t scanned a resume yet. Upload your resume on the main page to generate your first ATS compliance report.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary w-full justify-center">
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back &amp; Upload Resume</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { atsScore, wordCount, fileName, breakdown, parsedText, finalVerdict } = data;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreStroke = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: "Premium Compliant", cls: "badge-success" };
    if (score >= 60) return { label: "Average Strength", cls: "badge-warning" };
    return { label: "Needs Improvement", cls: "badge-danger" };
  };

  const getVerdictStyle = (rating) => {
    if (!rating) return { bg: "bg-[#6d4aff]/10", border: "border-[#6d4aff]/30", text: "text-[#a78bfa]", dot: "bg-[#a78bfa]" };
    const r = rating.toLowerCase();
    if (r === "excellent") return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" };
    if (r === "good")      return { bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-400",    dot: "bg-blue-400"    };
    if (r === "average")   return { bg: "bg-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-400",   dot: "bg-amber-400"   };
    return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" };
  };

  const scoreBadge = getScoreBadge(atsScore);
  const verdictStyle = getVerdictStyle(finalVerdict?.rating);
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (atsScore / 100) * circ;

  // ─── Annotated Resume Renderer ──────────────────────────────────────────────
  const renderAnnotatedResume = () => {
    if (!parsedText) return <p className="text-slate-400 text-xs">No document text parsed.</p>;
    const lines = parsedText.split(/\r?\n/).filter(l => l.trim().length > 0);

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      let weakBulletMatch = null;
      let weakBulletIdx = -1;

      (breakdown.content.weakBullets || []).forEach((wb, wbIdx) => {
        if (trimmed.toLowerCase().includes(wb.original.toLowerCase()) ||
            wb.original.toLowerCase().includes(trimmed.toLowerCase())) {
          weakBulletMatch = wb;
          weakBulletIdx = wbIdx;
        }
      });

      if (weakBulletMatch) {
        const isActive = activeTooltip === weakBulletIdx;
        return (
          <div
            key={lineIdx}
            className={`relative p-2 my-2 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
              isActive ? "border-amber-400 bg-amber-50" : "border-amber-300/70 bg-amber-50/50 hover:border-amber-400"
            }`}
            onClick={() => setActiveTooltip(isActive ? null : weakBulletIdx)}
          >
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-white mt-0.5">!</span>
              <p className="text-slate-700 text-[10px] leading-relaxed pr-8 font-medium">{trimmed}</p>
            </div>
            <span className="absolute right-2 top-2 text-[9px] text-amber-600 font-extrabold uppercase tracking-wide">AI Fix Available</span>

            {isActive && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 w-full rounded-xl bg-[#12121a] border border-amber-500/40 p-4 shadow-2xl text-left text-[#f0f0f8] animate-fade-up">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Optimization Proposal</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(weakBulletMatch.improved, weakBulletIdx); }}
                    className="flex items-center gap-1 text-[10px] text-[#a78bfa] font-bold hover:text-[#c4b5fd]"
                  >
                    {copiedId === weakBulletIdx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === weakBulletIdx ? "Copied!" : "Copy Fix"}</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] font-bold text-[#8e8ea8] uppercase tracking-wider">Diagnosis</span>
                    <p className="text-[10px] text-[#c4b5fd] leading-relaxed mt-0.5">{weakBulletMatch.reason}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">Recommended Rewrite</span>
                    <p className="text-[10px] text-white font-medium leading-relaxed">&quot;{weakBulletMatch.improved}&quot;</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      const matchedLower = (breakdown.keywords.matched || []).map(w => w.toLowerCase());
      const words = trimmed.split(/(\s+)/);
      const elements = words.map((word, wIdx) => {
        const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
        if (matchedLower.includes(clean)) {
          return (
            <span key={wIdx} className="bg-emerald-100 text-emerald-800 font-bold px-0.5 rounded border border-emerald-200" title="✓ Matched ATS Keyword">{word}</span>
          );
        }
        return word;
      });

      const isHeader = trimmed.length < 35 && (
        /^(skills|experience|projects|education|summary|contact)/i.test(trimmed) ||
        trimmed === trimmed.toUpperCase()
      );

      return (
        <p key={lineIdx} className={`leading-relaxed ${isHeader ? "text-[9px] font-extrabold text-slate-700 border-b border-slate-200 pb-1 mt-4 mb-2 uppercase tracking-widest" : "text-[10px] text-slate-600 font-medium"}`}>
          {elements}
        </p>
      );
    });
  };

  const tabs = [
    { id: "overview",   label: "AI Suggestions",     icon: Sparkles },
    { id: "keywords",   label: "Keywords",            icon: TrendingUp },
    { id: "sections",   label: "Sections",            icon: Target },
    { id: "skills",     label: "Skills Analysis",     icon: Code2 },
    { id: "summary",    label: "Summary Rewrite",     icon: User },
    { id: "tips",       label: "ATS Tips",            icon: Lightbulb },
    { id: "formatting", label: "Layout",              icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-[#f0f0f8] relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] bg-radial from-[#6d4aff]/8 to-transparent rounded-full pointer-events-none z-0" />
      <Navbar />

      <main className="grow max-w-345 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 z-10 flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-full lg:w-[48%] space-y-5 lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto lg:pr-2">

          {/* Header */}
          <div className="pb-4 border-b border-white/6">
            <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-[#a78bfa] font-semibold mb-3 hover:text-[#c4b5fd] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Analyze New Resume</span>
            </button>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Interactive Resume Report</h1>
            <p className="text-xs text-[#8e8ea8]">
              Parsed: <span className="text-white font-semibold">{fileName}</span>
            </p>
          </div>

          {/* Score + Verdict Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* ATS Score Ring */}
            <div className="glass p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#6d4aff] to-transparent opacity-60" />
              <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="60" cy="60" r={r}
                    stroke={getScoreStroke(atsScore)}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${getScoreColor(atsScore)}`}>{atsScore}</span>
                  <span className="text-[9px] text-[#8e8ea8] font-bold uppercase tracking-wider">ATS Score</span>
                </div>
              </div>
              <span className={`badge mt-3 ${scoreBadge.cls}`}>{scoreBadge.label}</span>
            </div>

            {/* Pillar sub-scores */}
            <div className="sm:col-span-2 glass p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Keywords", score: breakdown.keywords.score, color: "#a78bfa" },
                { label: "Layout",   score: breakdown.formatting.score, color: "#22c55e" },
                { label: "Sections", score: breakdown.sections.score,  color: "#a855f7" },
                { label: "AI Quality", score: breakdown.content.score, color: "#f472b6" },
              ].map(({ label, score, color }) => (
                <div key={label} className="space-y-1 p-2 rounded-lg bg-white/2 border border-white/6 text-center">
                  <span className="text-[9px] font-bold text-[#8e8ea8] uppercase tracking-wide">{label}</span>
                  <h4 className="text-lg font-extrabold" style={{ color }}>
                    {score}<span className="text-[10px] text-[#4e4e68]">/100</span>
                  </h4>
                  <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Final Verdict Banner ──────────────────────────────────────── */}
          {finalVerdict && (
            <div className={`flex items-start gap-4 p-4 rounded-2xl border ${verdictStyle.bg} ${verdictStyle.border} animate-fade-up`}>
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${verdictStyle.border} ${verdictStyle.bg}`}>
                <Award className={`h-5 w-5 ${verdictStyle.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-extrabold uppercase tracking-widest ${verdictStyle.text}`}>Final Verdict</span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${verdictStyle.bg} ${verdictStyle.border} ${verdictStyle.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${verdictStyle.dot} animate-pulse`} />
                    {finalVerdict.rating}
                  </span>
                </div>
                <p className="text-xs text-[#8e8ea8] leading-relaxed">{finalVerdict.summary}</p>
              </div>
            </div>
          )}

          {/* Upgrade CTA Strip */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-linear-to-r from-[#6d4aff]/10 to-[#a855f7]/10 border border-[#6d4aff]/20">
            <span className="text-xs text-white font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400 animate-bounce" />
              Score calculated — ready to build your perfect resume?
            </span>
            <button onClick={() => router.push("/builder")} className="btn-primary py-1.5 px-3 text-xs">
              <span>Smart Builder</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/6 overflow-x-auto gap-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-bold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? "border-[#6d4aff] text-[#a78bfa]"
                    : "border-transparent text-[#8e8ea8] hover:text-[#f0f0f8]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">

            {/* ── OVERVIEW: AI Suggestions ── */}
            {activeTab === "overview" && (
              <div className="glass p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#a78bfa]" />
                  <span>Recruiter Action Checklist</span>
                </h3>
                <ul className="space-y-2">
                  {(breakdown.content.suggestions || []).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-[#c4b5fd] leading-relaxed bg-white/2 border border-white/5 rounded-xl p-3">
                      <CheckCircle2 className="h-4 w-4 text-[#6d4aff] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── KEYWORDS ── */}
            {activeTab === "keywords" && (
              <div className="glass p-5 space-y-5">
                <div className="flex justify-between items-center p-3 rounded-lg bg-[#6d4aff]/5 border border-[#6d4aff]/10">
                  <span className="text-xs font-semibold text-[#8e8ea8]">Technical Keyword Density</span>
                  <span className="text-lg font-black text-[#a78bfa]">{breakdown.keywords.score}%</span>
                </div>
                <div className="space-y-4">
                  {(breakdown.keywords.matched || []).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">✓ Matched Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.keywords.matched.map(kw => (
                          <span key={kw} className="kw-matched">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(breakdown.keywords.missing || []).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">✗ Missing Critical Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.keywords.missing.slice(0, 15).map(kw => (
                          <span key={kw} className="kw-missing">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(breakdown.keywords.suggested || []).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">💡 AI-Suggested Keywords to Add</span>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.keywords.suggested.map(kw => (
                          <span key={kw} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTIONS CHECK ── */}
            {activeTab === "sections" && (
              <div className="glass p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#a78bfa]" />
                  <span>Resume Section Checklist</span>
                </h3>
                <p className="text-xs text-[#8e8ea8]">All 5 core sections should be present for maximum ATS compliance.</p>
                <div className="space-y-3">
                  {Object.entries(breakdown.sections.status || {}).map(([sec, present]) => {
                    const tip = breakdown.sections.tips?.[sec] || "";
                    return (
                      <div key={sec} className={`flex items-start gap-3 p-3.5 rounded-xl border ${present ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${present ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {present ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-bold uppercase tracking-wide ${present ? "text-emerald-400" : "text-red-400"}`}>
                              {sec.charAt(0).toUpperCase() + sec.slice(1)}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${present ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                              {present ? "Found" : "Missing"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8e8ea8] leading-relaxed">{tip}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SKILLS ANALYSIS ── */}
            {activeTab === "skills" && (
              <div className="glass p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#a78bfa]" />
                  <span>Technical Skills Breakdown</span>
                </h3>
                {["frontend", "backend", "tools"].map(cat => {
                  const skills = breakdown.skills?.categorized?.[cat] || [];
                  const colors = {
                    frontend: { pill: "bg-blue-500/10 text-blue-300 border-blue-500/20", label: "text-blue-400" },
                    backend:  { pill: "bg-purple-500/10 text-purple-300 border-purple-500/20", label: "text-purple-400" },
                    tools:    { pill: "bg-amber-500/10 text-amber-300 border-amber-500/20", label: "text-amber-400" }
                  };
                  const c = colors[cat];
                  return (
                    <div key={cat} className="p-3.5 rounded-xl bg-white/2 border border-white/6 space-y-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${c.label}`}>
                        {cat === "frontend" ? "🎨 Frontend" : cat === "backend" ? "⚙️ Backend" : "🔧 Tools & DevOps"}
                      </span>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map(s => (
                            <span key={s} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.pill}`}>{s}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#4e4e68] italic">No {cat} skills detected in your Skills section.</p>
                      )}
                    </div>
                  );
                })}
                <div className="p-3.5 rounded-xl bg-[#6d4aff]/5 border border-[#6d4aff]/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa]">🚀 Industry-Standard Skills to Consider Adding</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["TypeScript", "Docker", "CI/CD", "PostgreSQL", "Redis", "GraphQL", "Jest", "Kubernetes", "AWS", "Next.js"].map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#6d4aff]/10 text-[#a78bfa] border border-[#6d4aff]/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFESSIONAL SUMMARY REWRITE ── */}
            {activeTab === "summary" && (
              <div className="glass p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-[#a78bfa]" />
                  <span>AI Professional Summary Rewrite</span>
                </h3>
                <p className="text-xs text-[#8e8ea8]">
                  A strong 3–4 line summary at the top of your resume dramatically increases ATS match rates and recruiter first impressions.
                </p>
                {breakdown.summary?.rewrite ? (
                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-[#6d4aff]/10 to-[#a855f7]/5 border border-[#6d4aff]/25">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6d4aff]/60 to-transparent rounded-t-xl" />
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className="h-4 w-4 text-[#a78bfa] shrink-0 mt-0.5 animate-pulse" />
                      <span className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-widest">Gemini AI Generated</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      {breakdown.summary.rewrite}
                    </p>
                    <button
                      onClick={() => handleCopy(breakdown.summary.rewrite, "summary")}
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                    >
                      {copiedId === "summary" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedId === "summary" ? "Copied to clipboard!" : "Copy to clipboard"}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#4e4e68] italic">No summary rewrite available. Re-analyze your resume to generate one.</p>
                )}
              </div>
            )}

            {/* ── ATS OPTIMIZATION TIPS ── */}
            {activeTab === "tips" && (
              <div className="glass p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>ATS Optimization Tips</span>
                </h3>
                <p className="text-xs text-[#8e8ea8]">Apply these actionable improvements to maximize recruiter reach and ATS pass rates.</p>
                <ol className="space-y-3">
                  {(breakdown.atsTips || []).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/2 border border-white/6">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-400 border border-amber-500/25">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-[#c4b5fd] leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ── FORMATTING ── */}
            {activeTab === "formatting" && (
              <div className="glass p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Layout &amp; Parsability Anchors</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Email Anchor",       val: breakdown.formatting.hasEmail },
                    { label: "Phone Number",        val: breakdown.formatting.hasPhone },
                    { label: "Portfolio / Links",   val: breakdown.formatting.hasLinks },
                    { label: "Word Count", val: null, extra: `${breakdown.formatting.wordCount} words` },
                    { label: "Bullet Points", val: null, extra: `${breakdown.formatting.bulletPointsCount || 0} found` },
                  ].map(({ label, val, extra }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/6 text-xs">
                      <span className="font-semibold text-[#8e8ea8]">{label}</span>
                      {extra ? (
                        <span className="text-[#a78bfa] font-bold">{extra}</span>
                      ) : val ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Found</span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Missing</span>
                      )}
                    </div>
                  ))}
                </div>
                {(breakdown.formatting.feedback) && (
                  <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300">
                    <span className="font-bold text-blue-400 block mb-1">Length Feedback</span>
                    {breakdown.formatting.feedback}
                  </div>
                )}
                {(breakdown.formatting.issues || []).length > 0 && (
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide block">Identified Parsing Issues</span>
                    <ul className="space-y-1.5">
                      {breakdown.formatting.issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-[#c4b5fd] flex items-start gap-1.5 leading-relaxed">
                          <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL: Annotated Document View ────────────────────────── */}
        <div className="w-full lg:w-[52%] lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl glass border border-white/6">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#a78bfa]" />
              Interactive Annotated Resume Sheet
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-[#8e8ea8] uppercase bg-white/4 px-2.5 py-1 rounded border border-white/8">
              <HelpCircle className="h-3 w-3 text-[#a78bfa]" />
              Tap warnings for AI rewrites
            </span>
          </div>

          {/* Document Frame */}
          <div className="w-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="bg-white p-8 font-sans antialiased w-full text-left space-y-2 min-h-[297mm]">
              {/* Mock Header */}
              <div className="border-b-2 border-slate-200 pb-3 flex justify-between items-end mb-5">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">Alexander Wright</h2>
                  <span className="text-[8px] text-indigo-600 font-bold uppercase tracking-wider mt-1 block">CS Honors Student · Software Engineer</span>
                </div>
                <div className="text-right text-[8px] text-slate-500 font-semibold space-y-0.5 leading-none">
                  <p>alex.wright@gmail.com · +1 (555) 019-2834</p>
                  <p className="text-indigo-600">linkedin.com/in/alexwright</p>
                </div>
              </div>

              {/* Annotated Content */}
              <div className="space-y-2">
                {renderAnnotatedResume()}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#07070a]/90 py-8 z-10 relative text-xs text-[#8e8ea8]">
        <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white"><span className="text-[#6d4aff]">Resume</span>AI</span>
            <span className="text-[#4e4e68]">•</span>
            <span>Premium Career Accelerator</span>
          </div>
          <div className="flex items-center gap-1 text-[#4e4e68]">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 fill-current text-rose-500" />
            <span>for student engineers</span>
          </div>
          <div>© 2026 AI Resume ATS Suite. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
