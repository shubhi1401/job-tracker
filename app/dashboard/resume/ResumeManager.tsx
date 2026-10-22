
"use client";

import { useRef, useState } from "react";

type Resume = {
  id: number;
  fileName: string;
  createdAt: string;
};

export default function ResumeManager({
  initialResumes,
}: {
  initialResumes: Resume[];
}) {
  const [resumes, setResumes] = useState(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
const [deletingId, setDeletingId] = useState<number | null>(null);
  async function uploadResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: data,
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Upload failed.");

      setResumes((current) => [result, ...current]);
      setMessage("Resume uploaded successfully.");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
async function deleteResume(id: number) {
  if (!window.confirm("Are you sure you want to delete this resume?")) {
    return;
  }

  setDeletingId(id);
  setError("");
  setMessage("");

  try {
    const response = await fetch(`/api/resumes/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not delete resume.");
    }

    setResumes((current) => current.filter((resume) => resume.id !== id));
    setMessage("Resume deleted successfully.");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Delete failed.");
  } finally {
    setDeletingId(null);
  }
}
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Resume Manager</h1>
        <p className="mt-2 text-slate-400">
          Upload and manage your PDF resumes. Maximum size: 5 MB.
        </p>
      </div>

      <form
        onSubmit={uploadResume}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6"
      >
        <label className="block text-sm font-semibold text-slate-200">
          Choose a PDF resume
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            required
            className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
          />
        </label>

        {error && <p className="text-sm text-rose-300">{error}</p>}
        {message && <p className="text-sm text-emerald-300">{message}</p>}

        <button
          disabled={uploading}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">Your Resumes</h2>

        {resumes.length === 0 ? (
          <p className="rounded-xl border border-white/10 p-6 text-slate-400">
            No resumes uploaded yet.
          </p>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4"
            >
              <div>
                <p className="font-semibold text-white">{resume.fileName}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
  {/* View button */}
  <a
    href={`/api/resumes/${resume.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg border px-3 py-2 text-sm"
  >
    View
  </a>

  {/* Download button */}
  <a
    href={`/api/resumes/${resume.id}?download=true`}
    className="rounded-lg border px-3 py-2 text-sm"
  >
    Download
  </a>

  {/* Keep your existing Delete button here */}
</div>
              <button
  type="button"
  onClick={() => deleteResume(resume.id)}
  disabled={deletingId === resume.id}
  className="rounded-lg border border-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-400/10 disabled:opacity-50"
>
  {deletingId === resume.id ? "Deleting..." : "Delete"}
</button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
