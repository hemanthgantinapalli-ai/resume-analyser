"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PREMIUM_TEMPLATES, FONT_SIZES, FONT_FAMILIES } from "@/lib/templates";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Layout, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Hammer, 
  User as UserIcon,
  RefreshCw,
  Sliders,
  Type,
  ChevronLeft
} from "lucide-react";

export default function ResumeBuilder() {
  const previewRef = useRef(null);
  
  // 1. Template Management State
  const [templates, setTemplates] = useState(PREMIUM_TEMPLATES);
  const [currentTemplate, setCurrentTemplate] = useState(PREMIUM_TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fontSize, setFontSize] = useState("text-[10px]");
  const [fontFamily, setFontFamily] = useState("font-sans");
  const [fonts, setFonts] = useState({ sizes: FONT_SIZES, families: FONT_FAMILIES });

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates?action=list");
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
          setCurrentTemplate(data.templates[0]);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  // Template Handler Functions
  const handleSelectTemplate = (templateId) => {
    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      setCurrentTemplate(selected);
    }
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
  };

  const handleFontFamilyChange = (newFamily) => {
    setFontFamily(newFamily);
  };

  // 2. Student-optimized Core Resume State
  const [name, setName] = useState("Alexander Wright");
  const [email, setEmail] = useState("alex.wright@gmail.com");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [links, setLinks] = useState("linkedin.com/in/alexwright | github.com/alexw");
  const [summary, setSummary] = useState(
    "Ambitious Computer Science Honors Student with 4+ years of hands-on experience designing and optimizing frontend interfaces and RESTful microservices. Proficient in accelerating agile product cycles, database optimization, and scaling client-side performance."
  );
  
  const [skills, setSkills] = useState("React, Node.js, TypeScript, Next.js, Python, SQL, Docker, MongoDB, REST APIs, Git, Agile");
  
  const [experience, setExperience] = useState([
    {
      id: 1,
      company: "Innovative Tech Solutions",
      role: "Software Engineering Intern",
      duration: "Summer 2025",
      bullets: [
        "Spearheaded the refactoring of a legacy React architecture, yielding a 35% improvement in client-side page load velocity.",
        "Engineered robust Express.js API routers that scaled concurrent request capacities, improving database latency by 20%.",
        "Collaborated with senior developers to implement responsive fluid interfaces, boosting mobile user retention indices by 15%."
      ]
    },
    {
      id: 2,
      company: "University CS Department",
      role: "Undergraduate Teaching Assistant",
      duration: "2024 - 2025",
      bullets: [
        "Led weekly recitation sessions and lab reviews on Data Structures & Algorithms for 40+ students.",
        "Authored automated testing scripts to evaluate student grading matrices, reducing evaluation time overhead by 8 hours per week."
      ]
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-Commerce Cloud Engine",
      tech: "Next.js, Tailwind CSS, Stripe",
      bullets: [
        "Architected a serverless checkout sequence, successfully processing over 10,000 monthly transactions.",
        "Designed responsive user dashboards, yielding a 12% boost in overall checkout conversion."
      ]
    },
    {
      id: 2,
      title: "AI ATS Optimizer Suite",
      tech: "Python, Gemini API, Express.js",
      bullets: [
        "Developed a natural language scoring parser, evaluating resume text completeness with 92% accurate feedback.",
        "Engineered comparative diff overlays using React, displaying real-time keyword matches."
      ]
    }
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      institution: "State University of Technology",
      degree: "B.S. in Computer Science (GPA: 3.8/4.0)",
      duration: "2022 - 2026 (Expected)"
    }
  ]);

  // Form Handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now(),
        company: "New Company",
        role: "Software Intern",
        duration: "Summer 2026",
        bullets: ["Integrated core features, accelerating development pipelines."]
      }
    ]);
  };

  const handleRemoveExperience = (id) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const handleUpdateExperience = (id, field, value) => {
    setExperience(
      experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleExpBulletChange = (expId, bulletIdx, val) => {
    setExperience(
      experience.map(exp => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets];
          newBullets[bulletIdx] = val;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    );
  };

  const handleAddExpBullet = (expId) => {
    setExperience(
      experience.map(exp => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...exp.bullets, "Add high-impact accomplishment starting with an action verb."] };
        }
        return exp;
      })
    );
  };

  const handleRemoveExpBullet = (expId, bulletIdx) => {
    setExperience(
      experience.map(exp => {
        if (exp.id === expId) {
          const newBullets = exp.bullets.filter((_, idx) => idx !== bulletIdx);
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    );
  };

  // Projects Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now(),
        title: "Smart System Platform",
        tech: "React, Node.js",
        bullets: ["Developed primary features leading to enhanced metrics."]
      }
    ]);
  };

  const handleRemoveProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleUpdateProject = (id, field, value) => {
    setProjects(
      projects.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleProjBulletChange = (projId, bulletIdx, val) => {
    setProjects(
      projects.map(p => {
        if (p.id === projId) {
          const newBullets = [...p.bullets];
          newBullets[bulletIdx] = val;
          return { ...p, bullets: newBullets };
        }
        return p;
      })
    );
  };

  const handleAddProjBullet = (projId) => {
    setProjects(
      projects.map(p => {
        if (p.id === projId) {
          return { ...p, bullets: [...p.bullets, "Optimized performance by 30% utilizing modern systems."] };
        }
        return p;
      })
    );
  };

  const handleRemoveProjBullet = (projId, bulletIdx) => {
    setProjects(
      projects.map(p => {
        if (p.id === projId) {
          const newBullets = p.bullets.filter((_, idx) => idx !== bulletIdx);
          return { ...p, bullets: newBullets };
        }
        return p;
      })
    );
  };

  // Education Handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now(),
        institution: "State Academy",
        degree: "M.S. in Software Engineering",
        duration: "2022 - 2024"
      }
    ]);
  };

  const handleRemoveEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleUpdateEducation = (id, field, value) => {
    setEducation(
      education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  // ============================================================================
  // AI ASSIST INTEGRATION
  // ============================================================================

  const handleAIGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          links,
          summary: "Generate an ultra professional modern resume summary that sells my technical expertise.",
          skills,
          experience: experience.map(exp => ({ company: exp.company, role: exp.role, duration: exp.duration })),
          projects: projects.map(p => ({ title: p.title, technologies: [p.tech] })),
          education
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("AI summary generation error:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIOptimizeBullet = async (type, id, bulletIdx, originalText) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          tone: "technical"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewriting failed");

      const improvedText = data.changes[0]?.improved || data.improvedText || originalText;
      
      if (type === "experience") {
        handleExpBulletChange(id, bulletIdx, improvedText);
      } else {
        handleProjBulletChange(id, bulletIdx, improvedText);
      }
    } catch (e) {
      console.error("AI bullet optimization error:", e);
    } finally {
      setAiLoading(false);
    }
  };

  // ============================================================================
  // STANDALONE PDF COMPILING
  // ============================================================================

  const downloadPDF = async () => {
    setSaving(true);
    try {
      const element = previewRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Include template name in filename
      const templateName = currentTemplate?.name?.replace(/\s+/g, "_") || "Resume";
      const fileName = `${name.replace(/\s+/g, "_")}_${templateName}.pdf`;
      pdf.save(fileName);

      // Auto-save to database if user is logged in
      const savedUser = localStorage.getItem("ai_resume_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        try {
          await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              title: `${name} - ${currentTemplate?.name || "Resume"}`,
              rawText: `${name}\n${email}\n${phone}\n${links}\n\n${summary}\n\nSkills: ${skills}`,
              structuredData: { 
                experience, 
                projects, 
                education,
                template: currentTemplate?.id,
                fontSize,
                fontFamily
              },
              templateId: currentTemplate?.id || "modern",
              atsScore: 85
            })
          });
        } catch (err) {
          console.warn("Failed to auto-save resume:", err);
        }
      }
    } catch (e) {
      console.error("Error creating PDF document:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-[#f0f0f8] relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-radial from-[#6d4aff]/8 to-transparent rounded-full pointer-events-none z-0" />
      <Navbar />

      <main className="grow max-w-380 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col lg:flex-row gap-6 items-start z-10 relative">
        
        {/* Left Panel: Form Wizard & Settings */}
        <div className="w-full lg:w-[45%] space-y-5 lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto lg:pr-2">
          
          {/* Action header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/6 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] font-semibold text-[#a78bfa] mb-2">
                <Sparkles className="h-3 w-3 fill-current" />
                <span>11 Premium Student Templates</span>
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Smart Resume Builder</h1>
              <p className="text-xs text-[#8e8ea8] mt-0.5">Live-preview A4 resume editor with AI bullet optimizer</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleAIGenerateSummary}
                disabled={aiLoading}
                className="btn-outline-brand text-xs py-2 px-3"
              >
                {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>AI Summary</span>
              </button>
            </div>
          </div>

          {/* Quick Styling Controller */}
          <div className="glass p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#6d4aff] to-transparent opacity-50" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span>Typography & Layout Controls</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 text-[10px] font-bold text-[#8e8ea8] uppercase tracking-wide flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  <span>Font Family</span>
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="glass-input font-semibold text-white bg-[#12121a]"
                >
                  <option value="font-sans">Modern Sans-Serif (Inter)</option>
                  <option value="font-serif">Elegant Serif (Georgia)</option>
                  <option value="font-mono">Technical Mono (Fira Code)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-[#8e8ea8] uppercase tracking-wide">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="glass-input font-semibold text-white bg-[#12121a]"
                >
                  <option value="text-[9px]">Compact (9px)</option>
                  <option value="text-[10px]">Optimal (10px)</option>
                  <option value="text-[11px]">Large (11px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Template Grid Selector */}
          <div className="glass p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layout className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span>Select Template — {templates?.length || 11} Premium Designs</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-37 overflow-y-auto pr-1">
              {templates.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTemplate(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentTemplate?.id === item.id
                      ? "border-[#6d4aff] bg-[#6d4aff]/10 text-[#c4b5fd] shadow-md shadow-[#6d4aff]/10"
                      : "border-white/6 bg-white/2 text-[#8e8ea8] hover:text-white hover:border-white/12"
                  }`}
                >
                  <p className="text-[10px] font-bold truncate">{item.name.split(". ")[1] || item.name}</p>
                  <p className="text-[8px] text-[#4e4e68] mt-0.5 truncate">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Contact details */}
          <div className="glass p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span>1. Contact Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Full Name", val: name, set: setName, type: "text" },
                { label: "Email", val: email, set: setEmail, type: "email" },
                { label: "Phone", val: phone, set: setPhone, type: "text" },
                { label: "Portfolio Links", val: links, set: setLinks, type: "text" },
              ].map(({ label, val, set, type }) => (
                <div key={label}>
                  <label className="mb-1 block text-[9px] font-bold text-[#8e8ea8] uppercase tracking-wide">{label}</label>
                  <input type={type} value={val} onChange={e => set(e.target.value)} className="glass-input text-xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Summary details */}
          <div className="glass p-4 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span>2. Professional Statement</span>
            </h3>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="glass-input text-xs resize-none"
            />
          </div>

          {/* Section 3: Technical skills */}
          <div className="glass p-4 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Hammer className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span>3. Technical Skills <span className="text-[#4e4e68] normal-case font-normal">(comma-separated)</span></span>
            </h3>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Section 4: Experience details */}
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>4. Experience Timeline</span>
              </h3>
              <button
                onClick={handleAddExperience}
                className="flex items-center gap-1 rounded-lg bg-[#6d4aff]/10 border border-[#6d4aff]/20 px-2.5 py-1 text-[9px] font-bold text-[#a78bfa] hover:bg-[#6d4aff]/20 transition-all"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>Add Job</span>
              </button>
            </div>

            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-3 relative">
                  
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                        className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(exp.id, "duration", e.target.value)}
                        className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)}
                        className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Accomplishments</span>
                      <button
                        onClick={() => handleAddExpBullet(exp.id)}
                        className="text-[8px] font-semibold text-indigo-400 flex items-center space-x-0.5"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Add Accomplishment</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {exp.bullets.map((bullet, bulletIdx) => (
                        <div key={bulletIdx} className="flex items-start space-x-1.5">
                          <textarea
                            rows={1.5}
                            value={bullet}
                            onChange={(e) => handleExpBulletChange(exp.id, bulletIdx, e.target.value)}
                            className="grow rounded px-2 py-0.5 text-[10px] glass-input leading-tight"
                          />
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleRemoveExpBullet(exp.id, bulletIdx)}
                              className="text-gray-500 hover:text-red-400 p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleAIOptimizeBullet("experience", exp.id, bulletIdx, bullet)}
                              disabled={aiLoading}
                              className="text-indigo-400 hover:text-indigo-300 p-0.5"
                            >
                              <Sparkles className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Projects details */}
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layout className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>5. Key Projects</span>
              </h3>
              <button
                onClick={handleAddProject}
                className="flex items-center gap-1 rounded-lg bg-[#6d4aff]/10 border border-[#6d4aff]/20 px-2.5 py-1 text-[9px] font-bold text-[#a78bfa] hover:bg-[#6d4aff]/20 transition-all"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-3 relative">
                  
                  <button
                    onClick={() => handleRemoveProject(proj.id)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)}
                        className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Tech Stack</label>
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => handleUpdateProject(proj.id, "tech", e.target.value)}
                        className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Highlights</span>
                      <button
                        onClick={() => handleAddProjBullet(proj.id)}
                        className="text-[8px] font-semibold text-indigo-400 flex items-center space-x-0.5"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Add Highlight</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {proj.bullets.map((bullet, bulletIdx) => (
                        <div key={bulletIdx} className="flex items-start space-x-1.5">
                          <textarea
                            rows={1.5}
                            value={bullet}
                            onChange={(e) => handleProjBulletChange(proj.id, bulletIdx, e.target.value)}
                            className="grow rounded px-2 py-0.5 text-[10px] glass-input leading-tight"
                          />
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleRemoveProjBullet(proj.id, bulletIdx)}
                              className="text-gray-500 hover:text-red-400 p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleAIOptimizeBullet("project", proj.id, bulletIdx, bullet)}
                              disabled={aiLoading}
                              className="text-indigo-400 hover:text-indigo-300 p-0.5"
                            >
                              <Sparkles className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Education details */}
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>6. Credentials & Education</span>
              </h3>
              <button
                onClick={handleAddEducation}
                className="flex items-center gap-1 rounded-lg bg-[#6d4aff]/10 border border-[#6d4aff]/20 px-2.5 py-1 text-[9px] font-bold text-[#a78bfa] hover:bg-[#6d4aff]/20 transition-all"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="p-3 rounded-lg bg-black/20 border border-white/5 relative grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="col-span-2">
                    <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                      className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Duration</label>
                    <input
                      type="text"
                      value={edu.duration}
                      onChange={(e) => handleUpdateEducation(edu.id, "duration", e.target.value)}
                      className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="mb-0.5 block text-[8px] font-semibold text-gray-500">Degree Focus / GPA</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                      className="w-full rounded px-2 py-0.5 text-[11px] glass-input"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Panel: Interactive LIVE Document Preview & Downloader */}
        <div className="w-full lg:w-[53%] lg:sticky lg:top-20 space-y-4">
          
          {/* Download & Template Actions bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl glass border border-white/6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#8e8ea8] uppercase tracking-wider">Active:</span>
              <span className="badge badge-brand">
                {currentTemplate?.name?.split(". ")[1] || currentTemplate?.name || "Modern"}
              </span>
            </div>
            
            <button
              onClick={downloadPDF}
              disabled={saving}
              className="w-full sm:w-auto btn-primary py-2 px-5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>Download PDF Resume</span>
            </button>
          </div>

          {/* Interactive Document Page Frame */}
          <div className="w-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-white max-h-[calc(100vh-210px)] overflow-y-auto scrollbar-thin">
            
            {/* Standard A4 sheet */}
            <div
              ref={previewRef}
              id="resume-a4-document"
              className={`bg-white text-gray-800 p-8 font-sans antialiased ${fontSize} ${fontFamily} leading-relaxed w-full min-h-[297mm] shadow-inner relative`}
              style={{ minHeight: "297mm", boxSizing: "border-box" }}
            >
              
              {/* -------------------------------------------------------- */}
              {/* 1. MODERN SLATE */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "modern" && (
                <div className="space-y-4 text-left">
                  <div className="border-b-2 border-slate-700 pb-2.5 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">{name}</h2>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{experience[0]?.role || "Software Engineer"}</p>
                    </div>
                    <div className="text-right text-[9px] text-slate-500 font-semibold space-y-0.5 leading-none">
                      <p>{email} | {phone}</p>
                      <p>{links}</p>
                    </div>
                  </div>

                  {summary && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-0.5">Professional Statement</h4>
                      <p className="text-slate-600 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {skills && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-0.5">Technical Stack</h4>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {skills.split(",").map(s => s.trim()).join("  •  ")}
                      </p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-0.5">Experience</h4>
                      <div className="space-y-2">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} — <span className="text-slate-500 font-normal italic">{exp.company}</span></span>
                              <span className="text-[9px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-0.5">Key Projects</h4>
                      <div className="space-y-2">
                        {projects.map(proj => (
                          <div key={proj.id} className="space-y-0.5">
                            <p className="font-bold text-slate-700">{proj.title} <span className="text-slate-500 font-normal text-[8.5px] italic">({proj.tech})</span></p>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {proj.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-0.5">Education</h4>
                      <div className="space-y-1">
                        {education.map(edu => (
                          <div key={edu.id} className="flex justify-between items-center text-slate-700">
                            <span className="font-bold">{edu.degree} — <span className="text-slate-500 font-normal italic">{edu.institution}</span></span>
                            <span className="text-[9px] text-slate-400">{edu.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 2. TECH LEFT SIDEBAR */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "tech" && (
                <div className="flex gap-5 text-left h-full">
                  <div className="w-[30%] border-r border-slate-200 pr-4 space-y-4">
                    <div className="space-y-0.5 pb-2 border-b border-slate-100">
                      <h2 className="text-md font-extrabold text-slate-850 tracking-tight leading-tight">{name}</h2>
                      <p className="text-[9px] text-indigo-600 font-semibold italic">{experience[0]?.role || "Software Intern"}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact</h4>
                      <div className="text-slate-600 space-y-0.5 font-medium leading-tight">
                        <p>{phone}</p>
                        <p className="break-all">{email}</p>
                        <p className="wrap-break-word leading-normal">{links.split("|").map(l => l.trim()).join("\n")}</p>
                      </div>
                    </div>

                    {skills && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {skills.split(",").map(s => s.trim()).map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[8.5px] font-bold px-1.5 py-0.5 rounded border border-slate-150">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {education.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Academics</h4>
                        <div className="space-y-2">
                          {education.map(edu => (
                            <div key={edu.id} className="space-y-0.5 leading-none">
                              <p className="font-bold text-slate-700 leading-tight">{edu.degree}</p>
                              <p className="text-slate-500 italic leading-tight mt-0.5">{edu.institution}</p>
                              <p className="text-[8.5px] text-slate-400 font-medium mt-0.5">{edu.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-[70%] space-y-4">
                    {summary && (
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider pb-0.5 border-b-2 border-slate-700">Profile</h4>
                        <p className="text-slate-600 leading-relaxed">{summary}</p>
                      </div>
                    )}

                    {experience.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider pb-0.5 border-b-2 border-slate-700">Experience</h4>
                        <div className="space-y-2.5">
                          {experience.map(exp => (
                            <div key={exp.id} className="space-y-0.5">
                              <div className="flex justify-between items-center font-bold text-slate-700">
                                <span>{exp.role} — <span className="text-slate-500 font-normal italic">{exp.company}</span></span>
                                <span className="text-[9px] font-normal text-slate-400">{exp.duration}</span>
                              </div>
                              <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                                {exp.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider pb-0.5 border-b-2 border-slate-700">Projects</h4>
                        <div className="space-y-2">
                          {projects.map(proj => (
                            <div key={proj.id} className="space-y-0.5">
                              <p className="font-bold text-slate-700">{proj.title} <span className="text-slate-500 font-normal text-[8.5px] italic">({proj.tech})</span></p>
                              <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                                {proj.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 3. PROFESSIONAL EXECUTIVE */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "executive" && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1 pb-2 border-b-2 border-slate-800 max-w-lg mx-auto">
                    <h2 className="text-xl font-normal text-slate-800 tracking-wide">{name}</h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{experience[0]?.role || "Software Engineer"}</p>
                    <p className="text-[8.5px] text-slate-600 font-semibold font-sans">{email}  |  {phone}  |  {links}</p>
                  </div>

                  {summary && (
                    <div className="space-y-1 text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center">Executive Summary</h4>
                      <p className="text-slate-700 leading-relaxed font-sans">{summary}</p>
                    </div>
                  )}

                  {skills && (
                    <div className="space-y-1 text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center">Areas of Expertise</h4>
                      <p className="text-slate-700 leading-relaxed text-center font-sans font-medium">
                        {skills.split(",").map(s => s.trim()).join("  ·  ")}
                      </p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2.5 text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center">Career History</h4>
                      <div className="space-y-2">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700 font-sans">
                              <span>{exp.role}  —  <span className="text-slate-500 font-normal italic">{exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-500">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5 font-sans">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="space-y-2.5 text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center">Accomplishment Projects</h4>
                      <div className="space-y-2">
                        {projects.map(proj => (
                          <div key={proj.id} className="space-y-0.5">
                            <p className="font-bold text-slate-700 font-sans">{proj.title} <span className="text-slate-500 font-normal text-[8.5px] italic">({proj.tech})</span></p>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5 font-sans">
                              {proj.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.length > 0 && (
                    <div className="space-y-2.5 text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center">Academic Credentials</h4>
                      <div className="space-y-1">
                        {education.map(edu => (
                          <div key={edu.id} className="flex justify-between items-center text-slate-700 font-sans">
                            <span className="font-bold">{edu.degree}  —  <span className="text-slate-500 font-normal italic">{edu.institution}</span></span>
                            <span className="text-[8.5px] text-slate-400">{edu.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 4. CRISP MINIMALIST */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "minimalist" && (
                <div className="space-y-3 text-left">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-bold tracking-widest text-slate-800 uppercase leading-none">{name}</h2>
                    <p className="text-[8.5px] text-indigo-500 font-semibold tracking-wider uppercase">{experience[0]?.role || "Software Intern"}</p>
                    <p className="text-[8.5px] text-slate-400 font-medium">{email}   /   {phone}   /   {links}</p>
                  </div>
                  <div className="h-px bg-slate-200 my-2" />

                  {summary && (
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  )}

                  {skills && (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block">Competencies</span>
                      <p className="text-slate-600 leading-relaxed">{skills}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block">History</span>
                      <div className="space-y-2">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} <span className="font-medium text-slate-400">@ {exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block">Projects</span>
                      <div className="space-y-2">
                        {projects.map(proj => (
                          <div key={proj.id} className="space-y-0.5">
                            <p className="font-bold text-slate-700">{proj.title} <span className="text-slate-400 font-normal text-[8px] italic">({proj.tech})</span></p>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {proj.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 5. CREATIVE PORTFOLIO */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "creative" && (
                <div className="space-y-4 text-left">
                  {/* Glowing purple header line */}
                  <div className="h-2 w-full bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-t-lg -mx-8 -mt-8 mb-6" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-3 gap-2">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">{name}</h2>
                      <p className="text-[9.5px] text-purple-600 font-extrabold uppercase mt-1 tracking-wider">{experience[0]?.role || "Creative Engineer"}</p>
                    </div>
                    <div className="text-[8.5px] text-slate-500 font-bold space-y-0.5 leading-none sm:text-right">
                      <p>{email}  •  {phone}</p>
                      <p className="text-purple-500">{links}</p>
                    </div>
                  </div>

                  {summary && (
                    <div className="p-3.5 bg-linear-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-xl leading-relaxed text-slate-700">
                      {summary}
                    </div>
                  )}

                  {skills && (
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Tech Spectrum</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.split(",").map(s => s.trim()).map((s, idx) => (
                          <span key={idx} className="bg-purple-50 text-purple-700 text-[8px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Chronological Experience</h4>
                      <div className="space-y-3">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} <span className="text-purple-500 font-bold">@ {exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 6. FUNCTIONAL SKILLS-FIRST */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "skillsFirst" && (
                <div className="space-y-4 text-left">
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider">{name}</h2>
                    <p className="text-[9.5px] text-slate-500 font-semibold">{email}  |  {phone}  |  {links}</p>
                  </div>

                  {skills && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <h4 className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide text-center">Primary Technical Arsenal</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                        {skills.split(",").map(s => s.trim()).map((s, idx) => (
                          <span key={idx} className="bg-white text-slate-700 text-[8.5px] font-bold py-1 px-2 rounded border border-slate-200 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {summary && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Overview</span>
                      <p className="text-slate-600 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Employment History</span>
                      <div className="space-y-3">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} — <span className="font-semibold text-slate-500">{exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 7. ACADEMIC SCHOLAR */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "academic" && (
                <div className="space-y-4 text-left" style={{ fontFamily: "Georgia, serif" }}>
                  <div className="text-center pb-2 border-b-2 border-double border-slate-800">
                    <h2 className="text-xl font-normal tracking-wide text-slate-900">{name}</h2>
                    <p className="text-[9px] text-slate-500 font-semibold font-sans mt-0.5">{email}   •   {phone}   •   {links}</p>
                  </div>

                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center font-sans">Academic Foundation</h4>
                      <div className="space-y-2">
                        {education.map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-800">
                              <span>{edu.degree}</span>
                              <span className="text-[9px] font-normal text-slate-500 font-sans">{edu.duration}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-500 italic leading-none">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {summary && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center font-sans">Research Objective</h4>
                      <p className="text-slate-700 leading-relaxed font-sans">{summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 text-center font-sans">Professional History</h4>
                      <div className="space-y-2">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-800">
                              <span>{exp.role} <span className="font-normal italic text-slate-500">at {exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-500 font-sans">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5 font-sans">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 8. STARTUP HUSTLER */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "startup" && (
                <div className="space-y-3.5 text-left border-t-4 border-amber-500 pt-4">
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-800 leading-none">{name}</h2>
                      <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-1">{experience[0]?.role || "Hustler Software Intern"}</p>
                    </div>
                    <div className="text-[8.5px] text-slate-500 font-semibold text-right leading-tight">
                      <p>{email}  •  {phone}</p>
                      <p>{links}</p>
                    </div>
                  </div>

                  {summary && (
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  )}

                  {skills && (
                    <div className="flex items-start space-x-2">
                      <span className="text-[8.5px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 shrink-0 mt-0.5">Arsenal</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{skills}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5">Execution Timeline</h4>
                      <div className="space-y-2.5">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} <span className="font-semibold text-amber-600">@ {exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400 font-sans">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5 leading-relaxed">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 9. TIMELINE CHRONOLOGY */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "chronological" && (
                <div className="space-y-4 text-left">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight text-slate-800 leading-none">{name}</h2>
                      <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-1">{experience[0]?.role || "Software Engineer"}</p>
                    </div>
                    <div className="text-right text-[8.5px] text-slate-500 font-semibold leading-tight">
                      <p>{email}  |  {phone}</p>
                      <p className="text-indigo-600">{links}</p>
                    </div>
                  </div>

                  {summary && (
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  )}

                  {skills && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block">Primary Assets</span>
                      <p className="text-slate-600 font-medium">{skills}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block">Chronology Timeline</span>
                      
                      {/* Vertical timeline line */}
                      <div className="relative pl-6 border-l-2 border-slate-200 ml-2 space-y-4">
                        {experience.map(exp => (
                          <div key={exp.id} className="relative space-y-0.5">
                            {/* Glowing active node dot */}
                            <div className="absolute -left-7.75 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-white shadow-sm" />
                            
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} <span className="font-normal italic text-slate-400">({exp.company})</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 10. DOUBLE-COLUMN DENSE */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "doubleColumn" && (
                <div className="space-y-4 text-left">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-md font-extrabold text-slate-850 tracking-tight leading-none">{name}</h2>
                      <p className="text-[8.5px] text-slate-500 font-medium italic mt-0.5">{email}  |  {phone}</p>
                    </div>
                    <span className="text-[8.5px] text-indigo-600 font-bold text-right leading-none max-w-50 break-all">{links}</span>
                  </div>

                  {summary && (
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  )}

                  {skills && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block">Skills Arsenal</span>
                      <p className="text-slate-600 font-medium leading-normal">{skills}</p>
                    </div>
                  )}

                  {/* Split body into 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    
                    {/* Left Column Experience */}
                    {experience.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block border-b border-slate-200 pb-0.5">Experience</span>
                        <div className="space-y-2.5">
                          {experience.map(exp => (
                            <div key={exp.id} className="space-y-0.5">
                              <p className="font-bold text-slate-700 leading-tight">{exp.role}</p>
                              <p className="text-[8.5px] text-slate-400 font-semibold italic">{exp.company} — {exp.duration}</p>
                              <ul className="list-disc pl-3 text-slate-600 space-y-0.5 leading-tight mt-0.5">
                                {exp.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Right Column Projects */}
                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block border-b border-slate-200 pb-0.5">Selected Projects</span>
                        <div className="space-y-2.5">
                          {projects.map(proj => (
                            <div key={proj.id} className="space-y-0.5">
                              <p className="font-bold text-slate-700 leading-tight">{proj.title}</p>
                              <p className="text-[8.5px] text-slate-400 font-semibold italic">Stack: {proj.tech}</p>
                              <ul className="list-disc pl-3 text-slate-600 space-y-0.5 leading-tight mt-0.5">
                                {proj.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* 11. BOLD PROFESSIONAL */}
              {/* -------------------------------------------------------- */}
              {currentTemplate?.id === "bold" && (
                <div className="space-y-4 text-left">
                  {/* High contrast dark title banner */}
                  <div className="bg-slate-800 text-white p-5 rounded-xl -mx-8 -mt-8 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg font-black tracking-wider uppercase leading-none">{name}</h2>
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mt-1">{experience[0]?.role || "Software Engineer"}</p>
                    </div>
                    <div className="text-[8.5px] text-slate-300 font-semibold text-center sm:text-right space-y-0.5 leading-none">
                      <p>{email}  •  {phone}</p>
                      <p className="text-indigo-300">{links}</p>
                    </div>
                  </div>

                  {summary && (
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  )}

                  {skills && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block border-b border-slate-200 pb-0.5">Expertise Suite</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{skills}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block border-b border-slate-200 pb-0.5">Professional Employment</span>
                      <div className="space-y-2.5">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{exp.role} <span className="font-semibold text-slate-500">at {exp.company}</span></span>
                              <span className="text-[8.5px] font-normal text-slate-400">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
          <div>© 2026 AI Resume ATS Suite. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
