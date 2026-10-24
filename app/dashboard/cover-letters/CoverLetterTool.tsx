"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  MailPlus,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

type SavedApplication = {
  id: number;
  company: string;
  role: string;
  notes?: string | null;
};

type SavedResume = {
  id: number;
  fileName: string;
};

export default function CoverLetterTool({
  applications,
  resumes,
}: {
  applications: SavedApplication[];
  resumes: SavedResume[];
}) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [selectedResumeId, setSelectedResumeId] = useState(
    resumes.length > 0 ? String(resumes[0].id) : ""
  );
  const [resumeText, setResumeText] = useState("");
  const [extractingResume, setExtractingResume] = useState(false);

  const [tone, setTone] = useState<"confident" | "enthusiastic" | "concise">(
    "confident"
  );
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [highlightedSkills, setHighlightedSkills] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // When application dropdown changes, autofill fields
  function handleApplicationSelect(appId: string) {
    setSelectedAppId(appId);
    if (!appId) return;

    const chosen = applications.find((a) => String(a.id) === appId);
    if (chosen) {
      setCompany(chosen.company);
      setRole(chosen.role);
      if (chosen.notes) {
        setJobDescription(chosen.notes);
      }
    }
  }

  // Extract resume text whenever selected resume changes
  useEffect(() => {
    if (!selectedResumeId) return;

    let cancelled = false;
    setExtractingResume(true);

    async function loadResumeText() {
      try {
        const response = await fetch(`/api/resumes/${selectedResumeId}/text`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && data.text) {
          setResumeText(data.text);
        }
      } catch (err) {
        console.error("Resume text load error:", err);
      } finally {
        if (!cancelled) setExtractingResume(false);
      }
    }

    void loadResumeText();

    return () => {
      cancelled = true;
    };
  }, [selectedResumeId]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!company.trim() || !role.trim()) {
      setError("Please provide at least a Company name and Job role.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          jobDescription: jobDescription.trim(),
          resumeText: resumeText.trim(),
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter.");
      }

      setGeneratedLetter(data.coverLetter);
      setHighlightedSkills(data.highlightedSkills || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!generatedLetter) return;

    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-glow backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          AI Writing Assistant
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          AI Cover Letter Generator
        </h1>

        <p className="mt-2 text-slate-400">
          Craft tailored, persuasive cover letters that align your resume experience with any job opportunity.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
              <MailPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Target Position</h2>
              <p className="text-xs text-slate-400">
                Choose an existing application or enter custom details.
              </p>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </p>
          )}

          {applications.length > 0 && (
            <div>
              <label className={labelClass}>Autofill from Tracked Application</label>
              <select
                value={selectedAppId}
                onChange={(e) => handleApplicationSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Choose an application --</option>
                {applications.map((app) => (
                  <option key={app.id} value={String(app.id)}>
                    {app.company} — {app.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Company *</label>
              <input
                required
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputClass}
                placeholder="Google"
              />
            </div>

            <div>
              <label className={labelClass}>Role *</label>
              <input
                required
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
                placeholder="Senior Frontend Engineer"
              />
            </div>
          </div>

          {resumes.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Target Resume
                </label>
                {extractingResume && (
                  <span className="flex items-center gap-1 text-xs text-blue-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Extracting skills...
                  </span>
                )}
              </div>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className={inputClass}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.fileName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400">
              Tip: Upload your resume in{" "}
              <Link href="/dashboard/resume" className="text-blue-300 underline">
                My Resumes
              </Link>{" "}
              to automatically inject your skills and background.
            </div>
          )}

          <div>
            <label className={labelClass}>Tone & Voice</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "confident", label: "Confident" },
                { id: "enthusiastic", label: "Enthusiastic" },
                { id: "concise", label: "Concise" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTone(item.id as typeof tone)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                    tone === item.id
                      ? "border-blue-500 bg-blue-500/20 text-white shadow-glow"
                      : "border-white/10 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Job Description / Requirements (Optional)</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={inputClass}
              placeholder="Paste responsibilities or desired qualifications to enhance keyword alignment..."
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synthesizing Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </button>
        </form>

        {/* Output Panel */}
        <section className="flex flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Generated Letter</h2>
              <p className="text-xs text-slate-400">
                Review, edit, or copy your personalized letter.
              </p>
            </div>

            {generatedLetter && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
                  title="Download .txt"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            )}
          </div>

          {highlightedSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400">Highlighted skills:</span>
              {highlightedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex-1">
            {generatedLetter ? (
              <textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                rows={18}
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-blue-400"
              />
            ) : (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
                <MailPlus className="h-10 w-10 text-slate-500" />
                <p className="mt-3 font-semibold text-white">No letter generated yet</p>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Fill in your target role and click &quot;Generate Cover Letter&quot; to create a custom pitch aligned to your skills.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
