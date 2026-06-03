"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Briefcase, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle,
  FileDown,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Heart
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  // File Upload State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (fileExtension !== "pdf" && fileExtension !== "docx" && fileExtension !== "txt") {
      setError("Unsupported file format! Please upload PDF, DOCX, or TXT resumes.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a resume file to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze resume");

      // Save analysis results and target job description in localStorage for dashboard
      localStorage.setItem("ai_resume_analysis", JSON.stringify(data));
      localStorage.setItem("ai_resume_target_jd", jobDescription);
      
      // Auto save to DB history if user is logged in
      const savedUser = localStorage.getItem("ai_resume_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        try {
          await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              title: `ATS Report: ${file.name.replace(/\.[^/.]+$/, "")}`,
              rawText: data.parsedText || "",
              structuredData: data.breakdown,
              atsScore: data.atsScore,
              templateId: "modern"
            })
          });
        } catch (dbErr) {
          console.warn("Failed to auto-save report to user account:", dbErr);
        }
      }

      // Redirect to ATS Dashboard page
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred during parsing. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-[#f0f0f8] relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-radial from-[#6d4aff]/15 to-transparent rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-radial from-[#ec4899]/10 to-transparent rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-radial from-[#3b82f6]/10 to-transparent rounded-full pointer-events-none z-0" />

      {/* Navigation Header */}
      <Navbar />

      {/* HERO SECTION */}
      <main className="grow z-10 relative pt-24">
        <section className="section-sm">
          <div className="container-site">
            <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs font-semibold text-[#a78bfa] mb-6 shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />
                <span>Next-Gen Enhancv-Inspired Resume Engine v2.0</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white">
                Build & Optimize a <span className="gradient-text">Stunning Resume</span> <br className="hidden sm:inline" />
                That Gets You Intercepted & Hired
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-[#8e8ea8] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
                Go beyond standard checkers. Scan your resume for 30+ ATS compliance issues, perform deep contextual AI semantic keyword extraction, and customize beautiful templates tailored for students and tech grads.
              </p>

              {/* Fast stats row */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold text-[#8e8ea8]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% ATS Compliant</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Powered by Gemini AI</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#ffd93d]" />
                  <span>10+ Premium Student Templates</span>
                </div>
              </div>
            </div>

            {/* MAIN INTERACTIVE APP CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
              
              {/* LEFT CARD: SCAN RESUME */}
              <div className="lg:col-span-8 glass p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-linear-to-r from-transparent via-[#6d4aff] to-transparent opacity-60" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6d4aff]/10 border border-[#6d4aff]/20 text-[#a78bfa]">
                      <Upload className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Option A: ATS Resume Optimizer</h2>
                      <p className="text-xs text-[#8e8ea8]">Instantly extract structure, parse sections & test compliance</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge badge-brand">PDF</span>
                    <span className="badge badge-brand">DOCX</span>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 animate-fade-up">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleAnalyze} className="space-y-6">
                  
                  {/* Drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                      isDragOver 
                        ? "border-[#6d4aff] bg-[#6d4aff]/5 scale-[0.995]" 
                        : file 
                          ? "border-emerald-500/40 bg-emerald-500/5" 
                          : "border-white/10 hover:border-white/20 bg-white/1"
                    }`}
                  >
                    <input
                      type="file"
                      id="resume-file"
                      onChange={handleFileChange}
                      className="absolute inset-0 cursor-pointer opacity-0 z-10"
                    />

                    {file ? (
                      <div className="space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white max-w-70 sm:max-w-120 truncate mx-auto">{file.name}</p>
                          <p className="text-xs text-[#8e8ea8] mt-1">{(file.size / 1024).toFixed(1)} KB • Ready for deep analysis</p>
                        </div>
                        <span className="badge badge-success">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>File Loaded Successfully</span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6d4aff]/10 border border-[#6d4aff]/20 text-[#a78bfa] shadow-lg shadow-[#6d4aff]/5">
                          <Upload className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Drag & drop your resume file here or <span className="text-[#a78bfa] underline hover:text-[#c4b5fd]">browse</span></p>
                          <p className="text-xs text-[#8e8ea8] mt-1.5">Supports PDF, DOCX or TXT files up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Optional Job Description Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="jd" className="flex items-center gap-2 text-xs font-semibold text-[#8e8ea8] uppercase tracking-wider">
                        <Briefcase className="h-4 w-4 text-[#a78bfa]" />
                        <span>Target Job Description (Recommended)</span>
                      </label>
                      {jobDescription && (
                        <span className="text-[11px] text-[#a78bfa] font-semibold flex items-center gap-1">
                          <Zap className="h-3 w-3 fill-current" /> Auto-extracting keywords & skills
                        </span>
                      )}
                    </div>
                    <textarea
                      id="jd"
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description here. Our Gemini AI engine will parse the core responsibilities, missing hard/soft skills, and weigh your score against this role."
                      className="glass-input resize-none placeholder-[#4e4e68]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Contextual AI Analyzing & Scoring...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5 fill-current" />
                        <span>Run Advanced ATS Scoring Scan</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT SIDEBAR: OPTIONS B & C */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* OPTION B: SMART BUILDER */}
                <div className="glass p-6 hover:border-[#6d4aff]/30 shadow-xl group transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-linear-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#4ade80] group-hover:bg-emerald-500/20 transition-all">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Option B: Smart Builder</h3>
                      <p className="text-[11px] text-[#8e8ea8]">Create structured resumes from scratch</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#8e8ea8] leading-relaxed mb-6">
                    Perfect for students and early-career grads. Fill out a high-speed modular wizard, configure custom layouts, select from our 11 curated premium templates, and export compliant single-column PDFs.
                  </p>

                  <button
                    onClick={() => router.push("/builder")}
                    className="w-full flex items-center justify-between rounded-xl border border-white/6 bg-white/4 hover:bg-white/8 px-4 py-3 text-xs font-semibold text-white transition-all"
                  >
                    <span>Launch Student Builder Wizard</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* OPTION C: RESUME IMPROVER */}
                <div className="glass p-6 hover:border-[#a855f7]/30 shadow-xl group transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-linear-to-br from-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#c084fc] group-hover:bg-[#a855f7]/20 transition-all">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Option C: AI Improver</h3>
                      <p className="text-[11px] text-[#8e8ea8]">Side-by-side comparative editor</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#8e8ea8] leading-relaxed mb-6">
                    Paste raw bullet points and see instant contextual rewrites based on selected profiles (Tech, Metrics-driven, Executive). Audits your tone and displays clear side-by-side impact scoring improvements.
                  </p>

                  <button
                    onClick={() => router.push("/improver")}
                    className="w-full flex items-center justify-between rounded-xl border border-white/6 bg-white/4 hover:bg-white/8 px-4 py-3 text-xs font-semibold text-white transition-all"
                  >
                    <span>Launch Bullet Rewrite Suite</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            </div>

            {/* PREMIUM FEATURES / METHODOLOGY GRID */}
            <div className="glass p-8 sm:p-10 relative overflow-hidden bg-linear-to-br from-[#6d4aff]/5 via-transparent to-transparent mb-20">
              <div className="absolute top-0 right-0 h-px w-1/2 bg-linear-to-l from-white/10 to-transparent" />
              
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Our Core Scoring Framework</h2>
                <p className="text-sm text-[#8e8ea8]">We evaluate your resume across four fundamental pillars of professional success.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Pillar 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#a78bfa]">
                    <div className="h-7 w-7 rounded-lg bg-[#6d4aff]/10 flex items-center justify-center text-[#a78bfa]">
                      <Zap className="h-4 w-4 fill-current" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider">Semantic Analysis</span>
                  </div>
                  <h4 className="text-base font-bold text-white">AI Phrasing & Verb Density</h4>
                  <p className="text-xs text-[#8e8ea8] leading-relaxed">
                    Weak passive phrases get flagged. Our AI analyzes your verb density, active leadership descriptors, and parses grammar indicators to elevate your messaging from junior to professional.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider">Structural Compliance</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Section & Formatting Guard</h4>
                  <p className="text-xs text-[#8e8ea8] leading-relaxed">
                    Avoid critical visual parse errors. Traditional scanners reject two-column tables, graphics, headers, and strange bullet characters. We audit and output single-column CSS code compliant with green standards.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#ffd93d]">
                    <div className="h-7 w-7 rounded-lg bg-[#ffd93d]/10 flex items-center justify-center text-[#ffd93d]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider">Keyword Density</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Job Matching & Hard Skills</h4>
                  <p className="text-xs text-[#8e8ea8] leading-relaxed">
                    Instantly extract mandatory frameworks, methodologies, and technical requirements from job descriptions. We map matched keywords and list recommendations to elevate your profile match density.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
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
