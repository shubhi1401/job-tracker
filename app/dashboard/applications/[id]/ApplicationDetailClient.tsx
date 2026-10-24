"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Edit,
  ExternalLink,
  GraduationCap,
  Loader2,
  Mail,
  MailPlus,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

export type ApplicationData = {
  id: number;
  company: string;
  role: string;
  location: string;
  salary?: string | null;
  jobUrl?: string | null;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  applicationDate: string;
  interviewDate?: string | null;
  followUpDate?: string | null;
  followUpCompleted: boolean;
  notes?: string | null;
  createdAt: string;
};

const STAGES: {
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  label: string;
  color: string;
  activeBg: string;
}[] = [
  {
    status: "APPLIED",
    label: "Applied",
    color: "text-blue-400",
    activeBg: "bg-blue-600 text-white shadow-glow border-blue-500",
  },
  {
    status: "INTERVIEW",
    label: "Interviewing",
    color: "text-amber-400",
    activeBg: "bg-amber-600 text-white shadow-glow border-amber-500",
  },
  {
    status: "OFFER",
    label: "Offer Received",
    color: "text-emerald-400",
    activeBg: "bg-emerald-600 text-white shadow-glow border-emerald-500",
  },
  {
    status: "REJECTED",
    label: "Archived / Rejected",
    color: "text-rose-400",
    activeBg: "bg-rose-600 text-white shadow-glow border-rose-500",
  },
];

export default function ApplicationDetailClient({
  initialApplication,
}: {
  initialApplication: ApplicationData;
}) {
  const router = useRouter();
  const [app, setApp] = useState<ApplicationData>(initialApplication);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [togglingFollowUp, setTogglingFollowUp] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Inline date states
  const [editingInterviewDate, setEditingInterviewDate] = useState(false);
  const [interviewDateInput, setInterviewDateInput] = useState(
    app.interviewDate ? app.interviewDate.split("T")[0] : ""
  );

  const [editingFollowUpDate, setEditingFollowUpDate] = useState(false);
  const [followUpDateInput, setFollowUpDateInput] = useState(
    app.followUpDate ? app.followUpDate.split("T")[0] : ""
  );

  // Quick note append
  const [quickNote, setQuickNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  async function handleStatusChange(
    newStatus: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED"
  ) {
    if (newStatus === app.status || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status.");
      const updated = await res.json();
      setApp((prev) => ({ ...prev, status: updated.status }));
      showToast(`Status updated to ${newStatus}`);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleToggleFollowUp() {
    setTogglingFollowUp(true);
    const nextVal = !app.followUpCompleted;
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpCompleted: nextVal }),
      });

      if (!res.ok) throw new Error("Failed to update follow-up.");
      setApp((prev) => ({ ...prev, followUpCompleted: nextVal }));
      showToast(nextVal ? "Marked follow-up as completed!" : "Follow-up marked pending");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingFollowUp(false);
    }
  }

  async function handleSaveInterviewDate() {
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate: interviewDateInput
            ? new Date(`${interviewDateInput}T12:00:00`).toISOString()
            : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update interview date.");
      const updated = await res.json();
      setApp((prev) => ({ ...prev, interviewDate: updated.interviewDate }));
      setEditingInterviewDate(false);
      showToast("Interview date updated!");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveFollowUpDate() {
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUpDate: followUpDateInput
            ? new Date(`${followUpDateInput}T12:00:00`).toISOString()
            : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update follow-up date.");
      const updated = await res.json();
      setApp((prev) => ({ ...prev, followUpDate: updated.followUpDate }));
      setEditingFollowUpDate(false);
      showToast("Follow-up date updated!");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!quickNote.trim()) return;

    setSavingNote(true);
    const timestamp = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedNote = `[${timestamp}] ${quickNote.trim()}`;
    const updatedNotes = app.notes
      ? `${app.notes}\n\n${formattedNote}`
      : formattedNote;

    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      });

      if (!res.ok) throw new Error("Failed to append note.");
      setApp((prev) => ({ ...prev, notes: updatedNotes }));
      setQuickNote("");
      showToast("Note added to timeline!");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete application for ${app.role} at ${app.company}?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete application.");
      router.push("/dashboard/applications");
      router.refresh();
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-slate-950/95 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/applications/${app.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Application
          </Link>

          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                {app.company}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {app.location}
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {app.role}
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Applied on{" "}
              {new Date(app.applicationDate).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {app.salary && ` • Compensation: ${app.salary}`}
            </p>
          </div>

          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Original Job Posting
            </a>
          )}
        </div>

        {/* Interactive Status Pipeline Stepper */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pipeline Stage (Click to update):
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STAGES.map((st) => {
              const isCurrent = app.status === st.status;
              return (
                <button
                  key={st.status}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st.status)}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                    isCurrent
                      ? st.activeBg
                      : "border-white/10 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isCurrent && <Check className="h-3.5 w-3.5" />}
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Action Launcher Bar */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          JobTracker AI Tool Launchpad
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/dashboard/interview-prep?company=${encodeURIComponent(
              app.company
            )}&role=${encodeURIComponent(app.role)}`}
            className="group flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 transition hover:border-blue-500/40 hover:bg-blue-500/20 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-105 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Interview Prep</h4>
                <p className="text-[11px] text-blue-300">Role-specific Q&A</p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-blue-400 opacity-60 group-hover:opacity-100" />
          </Link>

          <Link
            href={`/dashboard/cover-letters?company=${encodeURIComponent(
              app.company
            )}&role=${encodeURIComponent(app.role)}`}
            className="group flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 transition hover:border-purple-500/40 hover:bg-purple-500/20 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-105 transition">
                <MailPlus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cover Letter</h4>
                <p className="text-[11px] text-purple-300">Generate tailored pitch</p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-purple-400 opacity-60 group-hover:opacity-100" />
          </Link>

          <Link
            href="/dashboard/referrals"
            className="group flex items-center justify-between rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 transition hover:border-indigo-500/40 hover:bg-indigo-500/20 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-105 transition">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Referrals CRM</h4>
                <p className="text-[11px] text-indigo-300">Find employee contacts</p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-indigo-400 opacity-60 group-hover:opacity-100" />
          </Link>

          <Link
            href="/dashboard/offers"
            className="group flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/20 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Offers & TC</h4>
                <p className="text-[11px] text-emerald-300">Negotiate package</p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-emerald-400 opacity-60 group-hover:opacity-100" />
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Recruiter & Key Dates */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recruiter Contact Card */}
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold text-white">Recruiter / Point of Contact</h3>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="font-semibold text-white">
                {app.recruiterName || "No contact name provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Email</p>
              {app.recruiterEmail ? (
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={`mailto:${app.recruiterEmail}?subject=${encodeURIComponent(
                      `Application Inquiry - ${app.role}`
                    )}`}
                    className="text-xs font-semibold text-blue-300 hover:underline"
                  >
                    {app.recruiterEmail}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyEmail(app.recruiterEmail!)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    title="Copy email"
                  >
                    {copiedEmail ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No email provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Key Dates & Reminders Card */}
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-white">Interview & Follow-up Actions</h3>
          </div>

          <div className="mt-4 space-y-4">
            {/* Interview Date Row */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3">
              <div>
                <p className="text-xs text-slate-400">Interview Date</p>
                {editingInterviewDate ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={interviewDateInput}
                      onChange={(e) => setInterviewDateInput(e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-950 p-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveInterviewDate}
                      className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingInterviewDate(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="mt-0.5 font-bold text-white">
                    {app.interviewDate
                      ? new Date(app.interviewDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not scheduled yet"}
                  </p>
                )}
              </div>

              {!editingInterviewDate && (
                <button
                  type="button"
                  onClick={() => setEditingInterviewDate(true)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10"
                >
                  {app.interviewDate ? "Reschedule" : "+ Schedule"}
                </button>
              )}
            </div>

            {/* Follow-up Date Row */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3">
              <div>
                <p className="text-xs text-slate-400">Follow-up Reminder</p>
                {editingFollowUpDate ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={followUpDateInput}
                      onChange={(e) => setFollowUpDateInput(e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-950 p-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveFollowUpDate}
                      className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFollowUpDate(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="mt-0.5 font-bold text-white">
                    {app.followUpDate
                      ? new Date(app.followUpDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No follow-up set"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingFollowUp}
                  onClick={handleToggleFollowUp}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    app.followUpCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                  }`}
                >
                  {app.followUpCompleted ? "✓ Completed" : "Mark Done"}
                </button>

                {!editingFollowUpDate && (
                  <button
                    type="button"
                    onClick={() => setEditingFollowUpDate(true)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Activity Timeline */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-bold">Interview Notes & Activity Timeline</h3>
          </div>
          <span className="text-xs text-slate-400">Auto-saved to application</span>
        </div>

        {/* Existing Notes Display */}
        <div className="mt-5 space-y-4">
          {app.notes ? (
            <div className="whitespace-pre-wrap rounded-2xl border border-white/5 bg-slate-950/60 p-5 text-xs leading-relaxed text-slate-200">
              {app.notes}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No notes recorded yet. Add your interview preparation notes, recruiter conversation feedback, or tech questions below.
            </p>
          )}

          {/* Quick Add Note Form */}
          <form onSubmit={handleAddNote} className="pt-2 space-y-3">
            <textarea
              rows={3}
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Append interview feedback or take-home progress (e.g., 'Completed Round 1 technical screening with Jane. Solved system architecture question. Next is hiring manager chat on Tuesday.')..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3.5 text-xs leading-relaxed text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingNote || !quickNote.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
              >
                {savingNote ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Adding note...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Append to Activity Log
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
