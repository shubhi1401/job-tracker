"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

type SavedApplication = {
  id: number;
  company: string;
  role: string;
};

type PrepGuide = {
  roleOverview: string;
  behavioralQuestions: {
    question: string;
    tips: string;
  }[];
  technicalQuestions: {
    question: string;
    keyPoints: string[];
  }[];
  smartQuestionsToAsk: string[];
};

export default function InterviewPrepTool({
  applications,
}: {
  applications: SavedApplication[];
}) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Mid-Level");

  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<PrepGuide | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"behavioral" | "technical" | "questions">("behavioral");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function handleApplicationSelect(appId: string) {
    setSelectedAppId(appId);
    if (!appId) return;

    const chosen = applications.find((a) => String(a.id) === appId);
    if (chosen) {
      setCompany(chosen.company);
      setRole(chosen.role);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!company.trim() || !role.trim()) {
      setError("Please provide both Company and Role.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/interview-prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate interview pack.");
      }

      setGuide(data.guide);
      setExpandedIndex(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-glow backdrop-blur">
          <GraduationCap className="h-3.5 w-3.5" />
          Interview Command Center
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          AI Interview Preparation
        </h1>

        <p className="mt-2 text-slate-400">
          Generate targeted behavioral questions (STAR method), technical deep-dives, and high-impact questions to ask your interviewers.
        </p>
      </div>

      {/* Target Role Selector */}
      <form
        onSubmit={handleGenerate}
        className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Target Opportunity</h2>
            <p className="text-xs text-slate-400">
              Select one of your tracked roles or test a custom role.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {applications.length > 0 && (
            <div className="sm:col-span-3">
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

          <div>
            <label className={labelClass}>Company *</label>
            <input
              required
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
              placeholder="e.g. Google"
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
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className={labelClass}>Seniority / Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={inputClass}
            >
              <option value="Entry / Junior">Entry / Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Staff / Lead">Staff / Lead</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Interview Pack...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Interview Prep Guide
            </>
          )}
        </button>
      </form>

      {/* Generated Guide */}
      {guide && (
        <div className="space-y-6">
          {/* Strategic Overview Card */}
          <div className="rounded-[1.75rem] border border-blue-400/20 bg-blue-500/[0.06] p-6 backdrop-blur">
            <div className="flex items-center gap-2.5 text-blue-300 font-bold text-sm mb-2">
              <Award className="h-4 w-4" />
              Strategic Overview for {company} ({level})
            </div>
            <p className="text-slate-300 leading-7 text-sm">
              {guide.roleOverview}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-2">
            {[
              { id: "behavioral", label: "Behavioral (STAR Method)", count: guide.behavioralQuestions.length },
              { id: "technical", label: "Technical & Scenarios", count: guide.technicalQuestions.length },
              { id: "questions", label: "Questions to Ask Them", count: guide.smartQuestionsToAsk.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300 font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab 1: Behavioral Questions */}
          {activeTab === "behavioral" && (
            <div className="space-y-4">
              {guide.behavioralQuestions.map((q, idx) => {
                const isExpanded = expandedIndex === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-blue-500/20 text-xs font-bold text-blue-300 mt-0.5">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-white text-base leading-6">
                          {q.question}
                        </h3>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-200 leading-6">
                          <strong className="block text-blue-300 mb-1">
                            💡 STAR Framework Strategy:
                          </strong>
                          {q.tips}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            My Talking Points & Example Story:
                          </label>
                          <textarea
                            rows={3}
                            value={notes[`b-${idx}`] || ""}
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [`b-${idx}`]: e.target.value,
                              }))
                            }
                            placeholder="Draft your situation, actions, and quantitative results here for quick practice..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Technical Questions */}
          {activeTab === "technical" && (
            <div className="space-y-4">
              {guide.technicalQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300 mt-0.5">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-white text-base leading-6">
                      {q.question}
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2 pl-9">
                    <p className="text-xs font-semibold text-slate-400">
                      High-impact concepts to highlight in your answer:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.keyPoints.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-2">
                      <textarea
                        rows={2}
                        value={notes[`t-${idx}`] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [`t-${idx}`]: e.target.value,
                          }))
                        }
                        placeholder="Key architectural choices or trade-offs to mention..."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Questions to Ask Them */}
          {activeTab === "questions" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Ask these high-signal questions at the end of your call to demonstrate technical leadership and deep curiosity:
              </p>

              {guide.smartQuestionsToAsk.map((qText, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 font-bold text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-200 leading-6 font-medium">
                    {qText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
