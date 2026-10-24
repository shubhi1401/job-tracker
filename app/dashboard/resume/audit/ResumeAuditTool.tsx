"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileText,
  Lightbulb,
  Loader2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

type SavedResume = {
  id: number;
  fileName: string;
};

type AuditResult = {
  score: number;
  wordCount: number;
  detectedSections: string[];
  missingSections: string[];
  foundStrongVerbs: string[];
  foundWeakPhrases: string[];
  metricCount: number;
  recommendations: string[];
};

export default function ResumeAuditTool({
  resumes,
  initialResumeId,
}: {
  resumes: SavedResume[];
  initialResumeId?: string;
}) {
  const [selectedResumeId, setSelectedResumeId] = useState(() => {
    if (initialResumeId && resumes.some((r) => String(r.id) === initialResumeId)) {
      return initialResumeId;
    }
    return resumes.length > 0 ? String(resumes[0].id) : "";
  });
  const [resumeText, setResumeText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  // Auto extract text when resume selected
  useEffect(() => {
    if (!selectedResumeId) return;

    let cancelled = false;
    setExtracting(true);
    setError("");

    async function loadText() {
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
        console.error("Audit resume text error:", err);
      } finally {
        if (!cancelled) setExtracting(false);
      }
    }

    void loadText();

    return () => {
      cancelled = true;
    };
  }, [selectedResumeId]);

  async function handleAnalyze(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");

    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError("Please select a resume or enter resume text to analyze.");
      return;
    }

    setAnalyzing(true);

    try {
      const response = await fetch("/api/resumes/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to audit resume.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          href="/dashboard/resume"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-blue-200 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Resumes
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-glow backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              ATS & Clarity Intelligence
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              AI Resume Audit
            </h1>

            <p className="mt-1 text-slate-400">
              Score your resume for ATS parseability, action verb strength, and quantified impact.
            </p>
          </div>
        </div>
      </div>

      {/* Selector & Run form */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur space-y-4">
        {error && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Resume to Audit
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Choose an uploaded PDF --</option>
              {resumes.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.fileName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void handleAnalyze()}
            disabled={analyzing || extracting || !resumeText}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50 sm:shrink-0"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing Resume...
              </>
            ) : extracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting Text...
              </>
            ) : (
              <>
                <FileCheck2 className="h-4 w-4" />
                Run ATS Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid gap-6 md:grid-cols-[220px_1fr] rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex flex-col items-center justify-center text-center border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <span className="text-xs font-semibold text-slate-400">ATS Readiness Score</span>

              <div
                className="my-4 flex h-32 w-32 items-center justify-center rounded-full border-8 shadow-glow"
                style={{
                  borderColor:
                    result.score >= 75
                      ? "#34d399"
                      : result.score >= 50
                        ? "#fbbf24"
                        : "#f87171",
                }}
              >
                <span className="text-3xl font-black text-white">{result.score}%</span>
              </div>

              <span className="text-xs font-medium text-slate-400">
                {result.score >= 75
                  ? "Strong & ATS-Ready"
                  : result.score >= 50
                    ? "Moderate Potential"
                    : "Needs Key Improvements"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 items-center">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center">
                <p className="text-2xl font-black text-white">{result.wordCount}</p>
                <p className="text-xs text-slate-400 mt-1">Total Words</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center">
                <p className="text-2xl font-black text-cyan-300">
                  {result.foundStrongVerbs.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">Impact Verbs</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-black text-emerald-300">
                  {result.metricCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">Quantified Metrics</p>
              </div>
            </div>
          </div>

          {/* Section Breakdown & Recommendations */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sections check */}
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Standard ATS Sections
              </h3>

              <div className="space-y-2">
                {result.detectedSections.map((sec) => (
                  <div
                    key={sec}
                    className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs"
                  >
                    <span className="font-semibold text-emerald-200">{sec}</span>
                    <span className="text-emerald-400 font-bold">Detected ✓</span>
                  </div>
                ))}

                {result.missingSections.map((sec) => (
                  <div
                    key={sec}
                    className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs"
                  >
                    <span className="font-semibold text-amber-200">{sec}</span>
                    <span className="text-amber-400 font-bold">Missing</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Language & Phrasing */}
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Action Verbs & Voice
              </h3>

              <div>
                <p className="text-xs text-slate-400 mb-2">Detected Power Verbs:</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.foundStrongVerbs.length > 0 ? (
                    result.foundStrongVerbs.map((verb) => (
                      <span
                        key={verb}
                        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200"
                      >
                        {verb}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None detected</span>
                  )}
                </div>
              </div>

              {result.foundWeakPhrases.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-rose-300 font-semibold mb-2">
                    Phrases to replace with decisive action verbs:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.foundWeakPhrases.map((phrase) => (
                      <span
                        key={phrase}
                        className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-300 line-through"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          {result.recommendations.length > 0 && (
            <div className="rounded-[1.75rem] border border-blue-400/20 bg-blue-500/[0.05] p-6 backdrop-blur">
              <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-blue-300" />
                Actionable Optimization Checklist
              </h3>

              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-xs text-slate-200 leading-5"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
