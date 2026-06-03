"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Upload, 
  FileText, 
  RefreshCw, 
  Check, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Info,
  CheckCircle2,
  Lock,
  Heart
} from "lucide-react";

export default function ResumeImprover() {
  // Input states
  const [originalText, setOriginalText] = useState("");
  const [tone, setTone] = useState("technical"); // technical | metrics | executive
  
  // API output states
  const [improvedText, setImprovedText] = useState("");
  const [scoreDelta, setScoreDelta] = useState(0);
  const [changes, setChanges] = useState([]);
  
  // Interface states
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse document");

      if (data.parsedText) {
        setOriginalText(data.parsedText);
      }
    } catch (err) {
      setError("Failed to parse resume: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImprove = async (e) => {
    e.preventDefault();
    if (!originalText.trim()) {
      setError("Please paste or upload your resume text to optimize.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          tone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to optimize resume");

      setImprovedText(data.improvedText);
      setScoreDelta(data.scoreDelta || 15);
      setChanges(data.changes || []);
    } catch (err) {
      setError(err.message || "An error occurred while rewriting. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-[#f0f0f8] relative overflow-hidden">
      {/* Background Noise & Blur */}
      <div className="noise-overlay" />
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-radial from-[#6d4aff]/10 to-transparent rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-[#a855f7]/10 to-transparent rounded-full pointer-events-none z-0" />

      <Navbar />

      <main className="grow z-10 relative pt-24 pb-16">
        <div className="container-site">
          
          {/* Header */}
          <div className="max-w-3xl mb-12 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs font-semibold text-[#a78bfa] mb-4">
              <Sparkles className="h-3.5 w-3.5 fill-current text-purple-400" />
              <span>Smart Side-by-Side Comparative Editor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              AI Bullet Points Improver
            </h1>
            <p className="text-sm text-[#8e8ea8] font-medium leading-relaxed max-w-xl">
              Upload your document or paste raw bullets. Select your professional tone profiles and let our generative AI rebuild sentences for high metrics-driven impact.
            </p>
          </div>

          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4.5 text-sm text-red-400 max-w-4xl animate-fade-up">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT INPUT BLOCK */}
            <div className="lg:col-span-6 glass p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#6d4aff] to-transparent opacity-65" />
              
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#a78bfa]" />
                  <span className="text-sm font-bold text-white tracking-tight">Original Resume Content</span>
                </div>
                
                {/* Micro Upload Trigger */}
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0 w-full"
                  />
                  <button
                    type="button"
                    disabled={uploadLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition-all"
                  >
                    {uploadLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    <span>Upload & Extract</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleImprove} className="space-y-5">
                <textarea
                  rows={14}
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste your resume summary, accomplishments, or raw bullets here..."
                  className="glass-input resize-none placeholder-[#4e4e68]"
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="tone-select" className="mb-1.5 block text-xs font-bold text-[#8e8ea8] uppercase tracking-wider">Optimize Focus Profile</label>
                    <select
                      id="tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="glass-input font-semibold text-white bg-[#12121a]"
                    >
                      <option value="technical">Technical (Inject engineering frameworks & tech stacks)</option>
                      <option value="metrics">Metrics (Enhance statistics, KPIs & quantitative outcomes)</option>
                      <option value="executive">Executive (Refine high-level vision, leadership & stakes)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading || !originalText.trim()}
                      className="btn-primary w-full py-3.5 px-6 font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                          <span>Rebuilding Bullets...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 fill-current" />
                          <span>Apply AI Enhancements</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT COMPARATIVE OUTPUT BLOCK */}
            <div className="lg:col-span-6 space-y-6">
              {improvedText ? (
                <div className="space-y-6 animate-fade-up">
                  
                  {/* Predicted Improvement Score */}
                  <div className="flex items-center justify-between p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">AI Improvement Gain</h3>
                        <p className="text-[11px] text-[#8e8ea8]">Projected resume ATS grade impact</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 text-emerald-400">
                      <span className="text-3xl font-extrabold font-sans">+{scoreDelta}</span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">ATS Points</span>
                    </div>
                  </div>

                  {/* Improved Content Box */}
                  <div className="glass p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-65" />
                    
                    <div className="flex items-center justify-between border-b border-white/6 pb-4 mb-4">
                      <h3 className="text-sm font-bold text-white tracking-tight">AI Improved Copy</h3>
                      <button
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-1.5 text-xs text-[#a78bfa] font-bold hover:text-[#c4b5fd] transition-all bg-white/4 px-3 py-1.5 rounded-lg border border-white/8"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? "Copied to Clipboard!" : "Copy Output"}</span>
                      </button>
                    </div>
                    
                    <textarea
                      rows={12}
                      value={improvedText}
                      onChange={(e) => setImprovedText(e.target.value)}
                      className="glass-input resize-none bg-[#0a0d15]/80 text-[#e4e4e7] border-emerald-500/10 focus:border-emerald-500/30"
                    />
                  </div>

                  {/* Audit Trail details */}
                  {changes.length > 0 && (
                    <div className="glass p-6 relative overflow-hidden shadow-xl">
                      <h3 className="text-sm font-bold text-white mb-4 tracking-tight flex items-center gap-2">
                        <Info className="h-4.5 w-4.5 text-[#a78bfa]" />
                        <span>Bullet-by-Bullet comparative review</span>
                      </h3>
                      
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {changes.map((change, idx) => (
                          <div key={idx} className="rounded-xl border border-white/6 bg-white/1 overflow-hidden text-xs">
                            <div className="bg-white/4 px-3 py-2 border-b border-white/6 font-extrabold text-[#a78bfa] uppercase tracking-wider text-[10px]">
                              Improvement Recommendation #{idx + 1}
                            </div>
                            <div className="p-3 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-[#8e8ea8] leading-relaxed">
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-red-400 mb-1">Original Phrasing</div>
                                  &quot;{change.original}&quot;
                                </div>
                                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-white font-medium leading-relaxed">
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Optimized Phrasing</div>
                                  &quot;{change.improved}&quot;
                                </div>
                              </div>
                              <p className="text-[11px] text-[#8e8ea8] bg-white/4 rounded-lg p-2.5 border border-white/6 leading-relaxed">
                                <strong>ATS Context Factor:</strong> {change.explanation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="glass p-8 h-full flex flex-col items-center justify-center text-center py-24 min-h-115">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6d4aff]/5 border border-[#6d4aff]/10 text-[#a78bfa] mb-4">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">No enhancements computed yet</h3>
                    <p className="text-xs text-[#8e8ea8] mt-2 max-w-xs leading-relaxed mx-auto">
                      Fill out or extract raw resume points inside the left panel, select your tone, and trigger AI to see comparative results.
                    </p>
                  </div>
                </div>
              )}
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
          <div>
            <span>© 2026 AI Resume ATS Suite. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
