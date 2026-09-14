"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    // Frontend validation
    if (!company || !role || !location || !applicationDate) {
      setError("Please fill all required fields.");
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
          company,
          role,
          location,
          jobUrl: jobUrl || null,
          salary: salary || null,
          status,
          recruiterName: recruiterName || null,
          recruiterEmail: recruiterEmail || null,
          applicationDate: new Date(applicationDate),
          notes: notes || null,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/applications");
        return;
      }

      const data = await response.json();

      setError(data.error || "Failed to create application");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Add New Application
        </h1>

        <p className="mt-2 text-slate-400">
          Fill in the details below to track a new job application.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.05] p-6"
      >
        {error && (
          <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {/* Company */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Company *
          </label>

          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="Google"
          />
        </div>

        {/* Role */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Role *
          </label>

          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="SDE Intern"
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Location *
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="Bangalore"
          />
        </div>

        {/* Job URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Job URL
          </label>

          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="https://company.com/jobs/123"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Salary
          </label>

          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="₹8 LPA"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none"
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Recruiter Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Recruiter Name
          </label>

          <input
            type="text"
            value={recruiterName}
            onChange={(e) => setRecruiterName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="John Smith"
          />
        </div>

        {/* Recruiter Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Recruiter Email
          </label>
          <input
            type="email"
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="john@company.com"
          />
        </div>
        {/* Application Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Application Date *
          </label>

          <input
            type="date"
            value={applicationDate}
            onChange={(e) => setApplicationDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
          />
        </div>
        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-28 w-full rounded-lg border border-white/10 bg-transparent p-3 text-white outline-none"
            placeholder="Add any notes about this application..."
          />
        </div>
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Application"}
        </button>
      </form>
    </div>
  );
}