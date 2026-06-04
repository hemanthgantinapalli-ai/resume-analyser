import { useState } from "react";

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    // optional user identifier; replace with real auth if needed
    form.append("x-user-id", "demo-user");
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve resume");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="upload-section max-w-3xl mx-auto my-12 p-8 bg-[#0a0a0f]/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl animate-fade-up">
      <h2 className="text-2xl font-bold text-white mb-4 text-center bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
        Boost Your ATS Score
      </h2>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Processing…
          </>
        ) : (
          "Upload & Improve"
        )}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          ❌ {error}
        </p>
      )}
      {result && (
        <article className="mt-6 p-6 bg-[#0a0a0f]/30 backdrop-blur-sm rounded-lg border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-2">🟢 ATS Score Improvement</h3>
          <p className="text-sm text-[#a78bfa] mb-4">
            Original: <strong>{result.originalScore}</strong> → Improved: <strong>{result.improvedScore}</strong>
          </p>
          <h4 className="text-lg font-medium text-white mb-2">Improved Resume</h4>
          <pre className="whitespace-pre-wrap text-sm text-[#e4e4e7] bg-[#0a0d15]/60 p-3 rounded-md border border-white/5 overflow-auto max-h-80">
            {result.improvedResume}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result.improvedResume);
            }}
            className="mt-3 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-500"
          >
            Copy to Clipboard
          </button>
        </article>
      )}
    </section>
  );
}
