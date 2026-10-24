"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

export default function NewApplicationPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");

  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [interviewDate, setInterviewDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Smart Autofill state
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [jobText, setJobText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);

  async function handleAutoFill() {
    if (!jobText.trim() || jobText.trim().length < 15) {
      setAiError("Please paste a job description with at least 15 characters.");
      return;
    }

    setParsing(true);
    setAiError("");
    setAiSuccess("");

    try {
      const response = await fetch("/api/applications/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse job description.");
      }

      if (data.company) setCompany(data.company);
      if (data.role) setRole(data.role);
      if (data.location) setLocation(data.location);
      if (data.salary) setSalary(data.salary);
      if (data.recruiterName) setRecruiterName(data.recruiterName);
      if (data.recruiterEmail) setRecruiterEmail(data.recruiterEmail);
      if (data.suggestedNotes) {
        setNotes((prev) => (prev ? `${prev}\n\n${data.suggestedNotes}` : data.suggestedNotes));
      }
      if (data.skills && Array.isArray(data.skills)) {
        setDetectedSkills(data.skills);
      }

      const extractedItems: string[] = [];
      if (data.role) extractedItems.push(`Role: "${data.role}"`);
      if (data.company) extractedItems.push(`Company: "${data.company}"`);
      if (data.location) extractedItems.push(`Location`);
      if (data.salary) extractedItems.push(`Salary`);

      if (extractedItems.length > 0) {
        setAiSuccess(`Auto-filled: ${extractedItems.join(" • ")}`);
      } else {
        setAiSuccess("Parsed details. Please verify the fields below.");
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to parse job.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!company.trim() || !role.trim() || !location.trim() || !applicationDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (followUpDate && followUpDate < applicationDate) {
      setError("Follow-up date cannot be before the application date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          location: location.trim(),
          jobUrl: jobUrl || null,
          salary: salary || null,
          status,
          recruiterName: recruiterName || null,
          recruiterEmail: recruiterEmail || null,
          applicationDate: new Date(`${applicationDate}T12:00:00`).toISOString(),
          interviewDate: interviewDate
            ? new Date(`${interviewDate}T12:00:00`).toISOString()
            : null,
          followUpDate: followUpDate
            ? new Date(`${followUpDate}T12:00:00`).toISOString()
            : null,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/applications");
        router.refresh();
        return;
      }

      const data = await response.json();
      setError(data.error || "Failed to create application.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/60 p-3 text-white placeholder-slate-500 outline-none focus:border-blue-500";

  const labelClass = "mb-2 block text-sm font-medium text-white";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/applications"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Applications
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Add New Application
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Fill in the details below or use AI Smart Autofill to parse a job description in seconds.
          </p>
        </div>
      </div>

      {/* AI Smart Autofill Drawer */}
      <section className="overflow-hidden rounded-[1.75rem] border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-slate-950 to-indigo-950/20 p-5 shadow-glow backdrop-blur sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                AI Smart Autofill
              </h2>
              <p className="text-xs text-slate-400">
                Paste any job posting from LinkedIn, Indeed, or company sites
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {isAiOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {isAiOpen && (
          <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
            <textarea
              rows={4}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste raw job description here... (e.g. 'Stripe is hiring a Staff Software Engineer in San Francisco / Remote. Compensation: $190,000 - $240,000. Requirements: TypeScript, React, Distributed Systems...')"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-xs leading-relaxed text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />

            {aiError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{aiError}</span>
              </div>
            )}

            {aiSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{aiSuccess}</span>
              </div>
            )}

            {detectedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Extracted Tech Stack & Skills:
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detectedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-md border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[11px] font-medium text-blue-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {jobText && (
                <button
                  type="button"
                  onClick={() => {
                    setJobText("");
                    setAiSuccess("");
                    setAiError("");
                    setDetectedSkills([]);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear Text
                </button>
              )}
              <div className="ml-auto">
                <button
                  type="button"
                  disabled={parsing || !jobText.trim()}
                  onClick={handleAutoFill}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-glow transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Parsing description...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5" />
                      Auto-Fill Form
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8"
      >
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
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
              placeholder="e.g. Google, Stripe"
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
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Location *</label>
            <input
              required
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="e.g. Remote (US) or San Francisco, CA"
            />
          </div>

          <div>
            <label className={labelClass}>Salary / Pay Range</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={inputClass}
              placeholder="e.g. $160,000 - $210,000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Job Posting URL</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className={inputClass}
              placeholder="https://company.com/careers/123"
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="APPLIED" className="bg-slate-900 text-white">Applied</option>
              <option value="INTERVIEW" className="bg-slate-900 text-white">Interview</option>
              <option value="OFFER" className="bg-slate-900 text-white">Offer</option>
              <option value="REJECTED" className="bg-slate-900 text-white">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Recruiter Name</label>
            <input
              type="text"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Sarah Jenkins"
            />
          </div>

          <div>
            <label className={labelClass}>Recruiter Email</label>
            <input
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              className={inputClass}
              placeholder="e.g. sarah@company.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Application Date *</label>
            <input
              required
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Interview Date</label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Optional upcoming interview round.
            </p>
          </div>

          <div>
            <label className={labelClass}>Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              min={applicationDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Optional reminder to contact recruiter.
            </p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes & Requirements</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} min-h-28`}
            placeholder="Key responsibilities, stack details, referral context, or recruiter notes..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/applications"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-glow transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Application"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
