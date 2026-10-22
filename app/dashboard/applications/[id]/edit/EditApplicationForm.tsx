
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Application = {
  id: number;
  company: string;
  role: string;
  jobUrl: string | null;
  location: string;
  salary: string | null;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  recruiterName: string | null;
  recruiterEmail: string | null;
  applicationDate: Date | string;
  interviewDate: Date | string | null;
  followUpDate: Date | string | null;
  followUpCompleted: boolean;
  notes: string | null;
};

type FormState = {
  company: string;
  role: string;
  jobUrl: string;
  location: string;
  salary: string;
  status: Application["status"];
  recruiterName: string;
  recruiterEmail: string;
  applicationDate: string;
  interviewDate: string;
  followUpDate: string;
  followUpCompleted: boolean;
  notes: string;
};

export default function EditApplicationForm({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toDateInput(date: Date | string | null): string {
    if (!date) return "";

    // Preserve a date-only value without timezone conversion.
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toISOString().slice(0, 10);
  }

  const [form, setForm] = useState<FormState>({
    company: application.company,
    role: application.role,
    jobUrl: application.jobUrl ?? "",
    location: application.location,
    salary: application.salary ?? "",
    status: application.status,
    recruiterName: application.recruiterName ?? "",
    recruiterEmail: application.recruiterEmail ?? "",
    applicationDate: toDateInput(application.applicationDate),
    interviewDate: toDateInput(application.interviewDate),
    followUpDate: toDateInput(application.followUpDate),
    followUpCompleted: application.followUpCompleted ?? false,
    notes: application.notes ?? "",
  });

  function updateField<K extends keyof FormState>(
    name: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (
      form.followUpDate &&
      form.applicationDate &&
      form.followUpDate < form.applicationDate
    ) {
      setError(
        "Follow-up date cannot be before the application date."
      );
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/applications/${application.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            applicationDate: new Date(
              `${form.applicationDate}T12:00:00`
            ).toISOString(),
            interviewDate: form.interviewDate
              ? new Date(
                  `${form.interviewDate}T12:00:00`
                ).toISOString()
              : null,
            followUpDate: form.followUpDate
              ? new Date(
                  `${form.followUpDate}T12:00:00`
                ).toISOString()
              : null,
            jobUrl: form.jobUrl.trim() || null,
            salary: form.salary.trim() || null,
            recruiterName: form.recruiterName.trim() || null,
            recruiterEmail: form.recruiterEmail.trim() || null,
            notes: form.notes.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not update application."
        );
      }

      router.push("/dashboard/applications");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-400";

  const labelClass = "space-y-2 text-sm text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Company *
          <input
            className={inputClass}
            required
            value={form.company}
            onChange={(e) =>
              updateField("company", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Job role *
          <input
            className={inputClass}
            required
            value={form.role}
            onChange={(e) =>
              updateField("role", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Location *
          <input
            className={inputClass}
            required
            value={form.location}
            onChange={(e) =>
              updateField("location", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Salary
          <input
            className={inputClass}
            value={form.salary}
            onChange={(e) =>
              updateField("salary", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Job URL
          <input
            className={inputClass}
            type="url"
            value={form.jobUrl}
            onChange={(e) =>
              updateField("jobUrl", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Status
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) =>
              updateField(
                "status",
                e.target.value as Application["status"]
              )
            }
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>

        <label className={labelClass}>
          Application date *
          <input
            className={inputClass}
            type="date"
            required
            value={form.applicationDate}
            onChange={(e) =>
              updateField("applicationDate", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Interview date
          <input
            className={inputClass}
            type="date"
            value={form.interviewDate}
            onChange={(e) =>
              updateField("interviewDate", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Follow-up date
          <input
            className={inputClass}
            type="date"
            min={form.applicationDate || undefined}
            value={form.followUpDate}
            onChange={(e) =>
              updateField("followUpDate", e.target.value)
            }
          />
          <span className="block text-xs text-slate-400">
            Leave empty to remove the reminder.
          </span>
        </label>

        <label className={labelClass}>
          Recruiter name
          <input
            className={inputClass}
            value={form.recruiterName}
            onChange={(e) =>
              updateField("recruiterName", e.target.value)
            }
          />
        </label>

        <label className={labelClass}>
          Recruiter email
          <input
            className={inputClass}
            type="email"
            value={form.recruiterEmail}
            onChange={(e) =>
              updateField("recruiterEmail", e.target.value)
            }
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.followUpCompleted}
          onChange={(e) =>
            updateField(
              "followUpCompleted",
              e.target.checked
            )
          }
          className="h-4 w-4 accent-blue-500"
        />
        Follow-up completed
      </label>

      <label className={`block ${labelClass}`}>
        Notes
        <textarea
          className={inputClass}
          rows={4}
          value={form.notes}
          onChange={(e) =>
            updateField("notes", e.target.value)
          }
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
