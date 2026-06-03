import "./globals.css";

export const metadata = {
  title: "AI Resume ATS Checker & Builder — Smart Optimization Engine",
  description: "Evaluate your resume against ATS tracking algorithms, rewrite high-impact bullet points with Gemini AI, build optimized templates, and check job description matching instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

