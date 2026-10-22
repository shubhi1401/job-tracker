
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

const SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "REST API",
  "GraphQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Prisma",
  "SQL",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Azure",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "NLP",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "Data Structures",
  "Algorithms",
  "OOP",
  "Problem Solving",
  "Communication",
  "Leadership",
  "Agile",
  "Linux",
  "Figma",
];

type MatchResult = {
  score: number;
  matched: string[];
  missing: string[];
  resumeSkills: string[];
  requiredSkills: string[];
};

type SavedResume = {
  id: number;
  fileName: string;
  createdAt: string;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/next\.?js/g, "nextjs")
    .replace(/express\.?js/g, "expressjs")
    .replace(/tailwind\s+css/g, "tailwindcss")
    .replace(/scikit.learn/g, "scikitlearn")
    .replace(/machine.learning/g, "machinelearning")
    .replace(/deep.learning/g, "deeplearning")
    .replace(/artificial.intelligence/g, "artificialintelligence")
    .replace(/data.structures/g, "datastructures")
    .replace(/problem.solving/g, "problemsolving")
    .replace(/rest\s+apis?/g, "restapi")
    .replace(/c\+\+/g, "cplusplus")
    .replace(/c#/g, "csharp")
    .replace(/[^a-z0-9+#]/g, " ");
}

function findSkills(text: string) {
  const normalized = normalize(text);

  return SKILLS.filter((skill) => {
    const normalizedSkill = normalize(skill)
      .trim()
      .replace(/\s+/g, "");

    const escapedSkill = normalizedSkill.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const pattern = new RegExp(
      `(^|[^a-z0-9+#])${escapedSkill}($|[^a-z0-9+#])`,
      "i"
    );

    return pattern.test(normalized);
  });
}

export default function ResumeMatchTool() {
  // All React hooks belong inside the component.
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");

  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [extracting, setExtracting] = useState(false);

  const resumeWordCount = useMemo(
    () => resume.trim().split(/\s+/).filter(Boolean).length,
    [resume]
  );

  const jobWordCount = useMemo(
    () => jobDescription.trim().split(/\s+/).filter(Boolean).length,
    [jobDescription]
  );

  // Load resumes already uploaded by the logged-in user.
  useEffect(() => {
    let cancelled = false;

    async function loadResumes() {
      try {
        const response = await fetch("/api/resumes", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load saved resumes.");
        }

        const data: SavedResume[] = await response.json();

        if (!cancelled) {
          setSavedResumes(data);

          if (data.length > 0) {
            setSelectedResumeId(String(data[0].id));
          }
        }
      } catch {
        if (!cancelled) {
          setError("Could not load your saved resumes.");
        }
      } finally {
        if (!cancelled) {
          setLoadingResumes(false);
        }
      }
    }

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Extract text from a previously uploaded PDF.
  async function extractSelectedResume() {
    if (!selectedResumeId) {
      setError("Please select a saved resume.");
      return;
    }

    setError("");
    setExtracting(true);

    try {
      const response = await fetch(
        `/api/resumes/${selectedResumeId}/text`,
        { cache: "no-store" }
      );

    const responseText = await response.text();

let data: { text?: string; error?: string };

try {
  data = JSON.parse(responseText);
} catch {
  console.error("PDF API response:", responseText);

  throw new Error(
    `The PDF API returned HTML instead of JSON. HTTP status: ${response.status}. Check the VS Code terminal.`
  );
}

      if (!response.ok) {
        throw new Error(
          data.error || "Could not extract resume text."
        );
      }

      if (typeof data.text !== "string" || !data.text.trim()) {
        throw new Error("No readable text was found in this PDF.");
      }

      setResume(data.text);
      setResult(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not extract resume text."
      );
    } finally {
      setExtracting(false);
    }
  }

  // Compare the resume against the job description.
  function analyzeResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (resume.trim().length < 30) {
      setError("Please enter more resume text before analyzing.");
      return;
    }

    if (jobDescription.trim().length < 30) {
      setError("Please enter a complete job description.");
      return;
    }

    const resumeSkills = findSkills(resume);
    const requiredSkills = findSkills(jobDescription);

    if (requiredSkills.length === 0) {
      setError(
        "No supported skills were detected in the job description. Add more technical or professional skill details."
      );
      return;
    }

    const matched = requiredSkills.filter((skill) =>
      resumeSkills.includes(skill)
    );

    const missing = requiredSkills.filter(
      (skill) => !resumeSkills.includes(skill)
    );

    const score = Math.round(
      (matched.length / requiredSkills.length) * 100
    );

    setResult({
      score,
      matched,
      missing,
      resumeSkills,
      requiredSkills,
    });
  }

  function resetAnalysis() {
    setResume("");
    setJobDescription("");
    setResult(null);
    setError("");
    setSelectedResumeId("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-blue-300">
            <span className="rounded-lg bg-blue-500/10 px-3 py-1">
              Resume Intelligence
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Resume–Job Match
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Compare your resume against a job description, identify
            relevant skills, and find gaps to work on.
          </p>
        </div>

        <Link
          href="/dashboard/resume"
          className="inline-flex w-fit items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
        >
          My Resumes
        </Link>
      </div>

      {/* Resume and job description form */}
      <form onSubmit={analyzeResume} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resume panel */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Your Resume
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select an uploaded PDF or paste your resume text.
              </p>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="savedResume"
                className="block text-sm font-medium text-slate-300"
              >
                Use an uploaded PDF
              </label>

              <select
                id="savedResume"
                value={selectedResumeId}
                onChange={(event) =>
                  setSelectedResumeId(event.target.value)
                }
                disabled={loadingResumes || extracting}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingResumes
                    ? "Loading resumes..."
                    : savedResumes.length === 0
                      ? "No uploaded resumes found"
                      : "Select a resume"}
                </option>

                {savedResumes.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.fileName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={extractSelectedResume}
                disabled={
                  !selectedResumeId ||
                  loadingResumes ||
                  extracting
                }
                className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {extracting
                  ? "Extracting PDF text..."
                  : "Extract Text from PDF"}
              </button>

              <p className="text-xs text-slate-500">
                Scanned or image-only PDFs may require OCR.
              </p>
            </div>

            <div>
              <label
                htmlFor="resumeText"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Resume text
              </label>

              <textarea
                id="resumeText"
                value={resume}
                onChange={(event) => setResume(event.target.value)}
                placeholder="Paste your resume here, including your skills, projects, education, and experience..."
                rows={13}
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Resume content</span>
              <span>{resumeWordCount} words</span>
            </div>
          </div>

          {/* Job description panel */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Job Description
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Paste the complete job posting.
              </p>
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Job requirements
              </label>

              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                placeholder="Paste the job description here, including required skills, qualifications, and responsibilities..."
                rows={13}
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Job requirements</span>
              <span>{jobWordCount} words</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Analyze Match
          </button>

          <button
            type="button"
            onClick={resetAnalysis}
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Analysis results */}
      {result && (
        <section aria-live="polite" className="space-y-6">
          <div className="grid gap-5 md:grid-cols-[240px_1fr]">
            {/* Score */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">
                Skill Match Score
              </p>

              <div
                className="my-5 flex h-36 w-36 items-center justify-center rounded-full border-8"
                style={{
                  borderColor:
                    result.score >= 70
                      ? "#4ade80"
                      : result.score >= 40
                        ? "#fbbf24"
                        : "#f87171",
                }}
              >
                <span className="text-4xl font-bold text-white">
                  {result.score}%
                </span>
              </div>

              <p className="text-center text-sm text-slate-400">
                {result.matched.length} of{" "}
                {result.requiredSkills.length} detected job skills
                match
              </p>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold text-white">
                Match Summary
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Your resume contains {result.matched.length} of the{" "}
                {result.requiredSkills.length} supported skills detected
                in this job description. Review the missing skills and
                tailor your resume truthfully to reflect your actual
                experience.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Matched</p>
                  <p className="mt-2 text-2xl font-bold text-green-400">
                    {result.matched.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Missing</p>
                  <p className="mt-2 text-2xl font-bold text-red-400">
                    {result.missing.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">
                    Resume Skills
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-400">
                    {result.resumeSkills.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Matched and missing skills */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-6">
              <h3 className="text-lg font-semibold text-green-300">
                Matching Skills
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Skills detected in both texts
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {result.matched.length > 0 ? (
                  result.matched.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No matching supported skills detected.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
              <h3 className="text-lg font-semibold text-red-300">
                Skills to Review
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Skills detected in the job description but not detected
                in your resume
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {result.missing.length > 0 ? (
                  result.missing.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    All detected job skills were found in your resume.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
            Note: This is a basic keyword-based estimate, not an
            employer&apos;s ATS score or an AI evaluation. It checks a
            predefined skill list and does not assess proficiency,
            context, or experience. A skill may also be present under
            different wording.
          </p>
        </section>
      )}
    </div>
  );
}
