"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, User, LogOut, Menu, X, ChevronDown, Zap, LayoutTemplate, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const saved = window.localStorage.getItem("ai_resume_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authTab, name: authTab === "register" ? name : undefined, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      localStorage.setItem("ai_resume_user", JSON.stringify(data.user));
      setUser(data.user);
      setAuthModal(false);
      setName(""); setEmail(""); setPassword("");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_resume_user");
    setUser(null);
    router.push("/");
  };

  const navLinks = [
    { label: "ATS Checker", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Resume Builder", href: "/builder" },
    { label: "AI Improver", href: "/improver" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "bg-transparent"
        }`}
      >
        <div className="container-site flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #6d4aff, #ec4899)" }}>
              <Sparkles className="h-4.5 w-4.5 text-white" />
              <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-[18px] font-bold tracking-tight">
              <span className="gradient-text">Resume</span>
              <span className="text-white">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/8 text-white"
                      : "text-[#8e8ea8] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm text-[#8e8ea8]">
                  <div className="h-6 w-6 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-30 truncate font-medium text-white">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-xs py-2 px-3"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthTab("login"); setAuthModal(true); }}
                  className="btn-ghost"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab("register"); setAuthModal(true); }}
                  className="btn-primary"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Get Started Free
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#8e8ea8] hover:text-white hover:bg-white/5"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-white/6 px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-purple-500/10 text-purple-300"
                    : "text-[#8e8ea8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/6 space-y-2">
              {user ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="btn-ghost w-full justify-center text-sm">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <>
                  <button onClick={() => { setAuthTab("login"); setAuthModal(true); setMobileOpen(false); }}
                    className="btn-ghost w-full justify-center text-sm">Sign In</button>
                  <button onClick={() => { setAuthTab("register"); setAuthModal(true); setMobileOpen(false); }}
                    className="btn-primary w-full justify-center text-sm">
                    <Zap className="h-4 w-4" /> Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* AUTH MODAL */}
      {authModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setAuthModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAuthModal(false)} />

          <div className="relative w-full max-w-md glass rounded-2xl p-8 shadow-2xl animate-fade-up">
            <button onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8e8ea8] hover:text-white hover:bg-white/8">
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                style={{ background: "linear-gradient(135deg,#6d4aff,#a855f7)" }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {authTab === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-[#8e8ea8]">
                {authTab === "login" ? "Sign in to save and access your resumes" : "Start building AI-optimized resumes today"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 mb-6">
              {["login", "register"].map((tab) => (
                <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    authTab === tab ? "bg-[#6d4aff] text-white shadow-lg" : "text-[#8e8ea8] hover:text-white"
                  }`}>
                  {tab === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <X className="h-4 w-4 shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authTab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#8e8ea8] mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" className="glass-input" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#8e8ea8] mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="glass-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e8ea8] mb-1.5 uppercase tracking-wide">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="glass-input" />
              </div>
              <button type="submit" disabled={authLoading} className="btn-primary w-full mt-2">
                {authLoading ? (
                  <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</span>
                ) : authTab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
