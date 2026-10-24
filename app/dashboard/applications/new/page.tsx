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

  const [interviewDate, setInterviewDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    "w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-blue-500";

  const labelClass = "mb-2 block text-sm font-medium text-white";

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
            placeholder="SDE Intern"
          />
        </div>

        <div>
          <label className={labelClass}>Location *</label>
          <input
            required
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="Bangalore"
          />
        </div>

        <div>
          <label className={labelClass}>Job URL</label>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className={inputClass}
            placeholder="https://company.com/jobs/123"
          />
        </div>

        <div>
          <label className={labelClass}>Salary</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
            placeholder="₹8 LPA"
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Recruiter Name</label>
          <input
            type="text"
            value={recruiterName}
            onChange={(e) => setRecruiterName(e.target.value)}
            className={inputClass}
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className={labelClass}>Recruiter Email</label>
          <input
            type="email"
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
            className={inputClass}
            placeholder="john@company.com"
          />
        </div>

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
          <p className="mt-1 text-xs text-slate-400">
            Optional — schedule an upcoming interview round.
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
          <p className="mt-1 text-xs text-slate-400">
            Optional — choose when to contact the recruiter.
          </p>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} min-h-28`}
            placeholder="Add any notes about this application..."
          />
        </div>

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
