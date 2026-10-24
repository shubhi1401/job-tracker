"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
} from "lucide-react";

type Resume = {
  id: number;
  fileName: string;
  createdAt: string;
};

export default function ResumeManagerClient({
  initialResumes,
}: {
  initialResumes: Resume[];
}) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function handleFileUpload(file: File) {
    setError("");
    setSuccess("");

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume file must be 5 MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload resume.");
      }

      setResumes((prev) => [data, ...prev]);
      setSuccess(`"${file.name}" uploaded successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number, fileName: string) {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete resume.");
      }

      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccess(`"${fileName}" deleted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete resume.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      void handleFileUpload(droppedFile);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-glow backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Resume Management
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            My Resumes
          </h1>

          <p className="mt-2 text-slate-400">
            Upload and manage your PDF resumes for applications and AI match scoring.
          </p>
        </div>

        <Link
          href="/dashboard/resume-match"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-glow"
        >
          <Target className="h-4 w-4" />
          Open Resume Match
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h2 className="text-xl font-bold text-white">Upload New Resume</h2>
        <p className="mt-1 text-sm text-slate-400">
          Upload a clean PDF copy of your resume (up to 5 MB).
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-white/15 bg-slate-950/40 hover:border-blue-400/50 hover:bg-white/[0.02]"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleFileUpload(file);
                e.target.value = "";
              }
            }}
          />

          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          <p className="mt-4 font-semibold text-white">
            {uploading
              ? "Uploading and validating PDF..."
              : "Click to upload or drag & drop"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PDF format only (max. 5 MB)
          </p>
        </label>
      </section>

      {/* Resumes List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Saved Resumes</h2>
          <span className="text-sm text-slate-400">
            {resumes.length} {resumes.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No resumes uploaded yet
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Upload your first resume PDF above to start analyzing it against jobs.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                    <FileText className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {resume.fileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Uploaded on{" "}
                      {new Date(resume.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <a
                    href={`/api/resumes/${resume.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </a>

                  <a
                    href={`/api/resumes/${resume.id}?download=true`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>

                  <Link
                    href="/dashboard/resume-match"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                  >
                    <Target className="h-4 w-4" />
                    Match Job
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId === resume.id}
                    onClick={() => handleDelete(resume.id, resume.fileName)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tips panel */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        <h4 className="font-semibold text-slate-200">How JobTracker AI handles your resumes</h4>
        <p className="mt-1 leading-6">
          Resumes are securely stored in a private directory accessible only to your account.
          Our integrated parser extracts selectable text so you can benchmark your skills against job descriptions without sending your private files to third-party public models.
        </p>
      </section>
    </div>
  );
}
