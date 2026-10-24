"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Filter,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wand2,
  X,
} from "lucide-react";
import type { Referral, ReferralStatus } from "@/lib/referrals-storage";

type ApplicationOption = {
  id: number;
  company: string;
  role: string;
};

type OutreachType =
  | "LINKEDIN_NOTE"
  | "COFFEE_CHAT"
  | "RECRUITER_PITCH"
  | "FOLLOW_UP";

type OutreachResult = {
  subject: string;
  message: string;
  characterCount: number;
  outreachType: OutreachType;
  tips: string[];
};

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const STATUS_CONFIG: Record<
  ReferralStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  REACHED_OUT: {
    label: "Reached Out",
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  CALL_SCHEDULED: {
    label: "Call Scheduled",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  REFERRED: {
    label: "Referred",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
  },
  INTERVIEWING: {
    label: "Interviewing",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  NO_RESPONSE: {
    label: "No Response",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-500",
  },
  DECLINED: {
    label: "Declined",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },
};

const RELATIONSHIP_OPTIONS = [
  "Alumni",
  "Ex-Colleague",
  "LinkedIn Outreach",
  "Recruiter",
  "Tech Meetup / Event",
  "Mutual Connection",
  "Friend / Family",
  "Other",
];

export default function ReferralsClient({
  initialReferrals,
  applications,
}: {
  initialReferrals: Referral[];
  applications: ApplicationOption[];
}) {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formRelationship, setFormRelationship] = useState(RELATIONSHIP_OPTIONS[0]);
  const [formLinkedinUrl, setFormLinkedinUrl] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<ReferralStatus>("REACHED_OUT");
  const [formApplicationId, setFormApplicationId] = useState<string>("");
  const [formFollowUpDate, setFormFollowUpDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Outreach Modal state
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [outreachContact, setOutreachContact] = useState<Referral | null>(null);
  const [outreachType, setOutreachType] = useState<OutreachType>("LINKEDIN_NOTE");
  const [targetRoleInput, setTargetRoleInput] = useState("Software Engineer");
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachResult, setOutreachResult] = useState<OutreachResult | null>(null);
  const [copiedOutreach, setCopiedOutreach] = useState(false);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = referrals.length;
    const active = referrals.filter(
      (r) => r.status === "REACHED_OUT" || r.status === "CALL_SCHEDULED"
    ).length;
    const referred = referrals.filter(
      (r) => r.status === "REFERRED" || r.status === "INTERVIEWING"
    ).length;
    const interviewing = referrals.filter((r) => r.status === "INTERVIEWING").length;
    const conversionRate = total > 0 ? Math.round((interviewing / total) * 100) : 0;

    return { total, active, referred, interviewing, conversionRate };
  }, [referrals]);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchesSearch =
        search === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.role.toLowerCase().includes(search.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        selectedStatus === "ALL" || r.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [referrals, search, selectedStatus]);

  function openCreateModal() {
    setEditingReferral(null);
    setFormName("");
    setFormCompany("");
    setFormRole("");
    setFormRelationship(RELATIONSHIP_OPTIONS[0]);
    setFormLinkedinUrl("");
    setFormEmail("");
    setFormStatus("REACHED_OUT");
    setFormApplicationId("");
    setFormFollowUpDate("");
    setFormNotes("");
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(referral: Referral) {
    setEditingReferral(referral);
    setFormName(referral.name);
    setFormCompany(referral.company);
    setFormRole(referral.role);
    setFormRelationship(
      RELATIONSHIP_OPTIONS.includes(referral.relationship)
        ? referral.relationship
        : "Other"
    );
    setFormLinkedinUrl(referral.linkedinUrl || "");
    setFormEmail(referral.email || "");
    setFormStatus(referral.status);
    setFormApplicationId(
      referral.applicationId ? String(referral.applicationId) : ""
    );
    setFormFollowUpDate(
      referral.followUpDate ? referral.followUpDate.split("T")[0] : ""
    );
    setFormNotes(referral.notes || "");
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingReferral(null);
    setError("");
  }

  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formCompany.trim() || !formRole.trim()) {
      setError("Please fill in contact name, company, and role.");
      return;
    }

    setSaving(true);
    setError("");

    const selectedApp = applications.find(
      (a) => String(a.id) === formApplicationId
    );

    const payload = {
      name: formName.trim(),
      company: formCompany.trim(),
      role: formRole.trim(),
      relationship: formRelationship,
      linkedinUrl: formLinkedinUrl.trim() || undefined,
      email: formEmail.trim() || undefined,
      status: formStatus,
      applicationId: selectedApp ? selectedApp.id : null,
      applicationName: selectedApp
        ? `${selectedApp.company} - ${selectedApp.role}`
        : null,
      followUpDate: formFollowUpDate ? new Date(formFollowUpDate).toISOString() : null,
      notes: formNotes.trim(),
    };

    try {
      if (editingReferral) {
        // Update existing
        const res = await fetch(`/api/referrals/${editingReferral.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update contact.");

        setReferrals((prev) =>
          prev.map((r) => (r.id === editingReferral.id ? data : r))
        );
      } else {
        // Create new
        const res = await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add contact.");

        setReferrals((prev) => [data, ...prev]);
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickStatusChange(id: string, newStatus: ReferralStatus) {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Could not update status.");
      const updated = await res.json();

      setReferrals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Could not delete contact.");
      setReferrals((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openOutreachModal(contact: Referral) {
    setOutreachContact(contact);
    const suggestedRole = contact.applicationName
      ? contact.applicationName.split(" - ")[1] || "Software Engineer"
      : "Software Engineer";
    setTargetRoleInput(suggestedRole);
    setOutreachType(
      contact.relationship.toLowerCase().includes("recruiter")
        ? "RECRUITER_PITCH"
        : "LINKEDIN_NOTE"
    );
    setOutreachResult(null);
    setCopiedOutreach(false);
    setIsOutreachOpen(true);
  }

  async function handleGenerateOutreach() {
    if (!outreachContact) return;

    setGeneratingOutreach(true);
    try {
      const res = await fetch("/api/referrals/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: outreachContact.name,
          company: outreachContact.company,
          contactRole: outreachContact.role,
          relationship: outreachContact.relationship,
          targetRole: targetRoleInput.trim() || "Software Engineer",
          outreachType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate outreach pitch.");
      setOutreachResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingOutreach(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 shadow-glow backdrop-blur">
            <Users className="h-3.5 w-3.5" />
            Networking CRM
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Referrals & Outreach
          </h1>
          <p className="mt-2 text-slate-400">
            Track employee referrals, alumni coffee chats, and recruiter contacts to accelerate interviews.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500"
        >
          <UserPlus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Contacts
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{metrics.total}</p>
          <p className="mt-1 text-xs text-slate-400">Active professional network</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active Outreach
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-300">{metrics.active}</p>
          <p className="mt-1 text-xs text-slate-400">Messages & calls in flight</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Referrals Secured
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-purple-300">{metrics.referred}</p>
          <p className="mt-1 text-xs text-slate-400">Internal company referrals</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Interview Conversion
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-300">
            {metrics.conversionRate}%
          </p>
          <p className="mt-1 text-xs text-slate-400">Led directly to interview</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, company, role, or notes..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedStatus("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedStatus === "ALL"
                ? "bg-blue-600 text-white"
                : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            All ({referrals.length})
          </button>
          {(
            [
              "REACHED_OUT",
              "CALL_SCHEDULED",
              "REFERRED",
              "INTERVIEWING",
              "NO_RESPONSE",
            ] as ReferralStatus[]
          ).map((st) => {
            const count = referrals.filter((r) => r.status === st).length;
            const config = STATUS_CONFIG[st];
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedStatus === st
                    ? `${config.bg} ${config.text} border ${config.border} font-bold`
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts List / Grid */}
      {filteredReferrals.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
          <Users className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-bold text-white">
            {search || selectedStatus !== "ALL"
              ? "No contacts match your filter"
              : "No networking contacts yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            {search || selectedStatus !== "ALL"
              ? "Try resetting your search query or status filter to see all contacts."
              : "Reaching out to employees increases interview response rates by up to 400%. Add your first contact to get started."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReferrals.map((r) => {
            const statusInfo = STATUS_CONFIG[r.status];
            const initials = r.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-white/20"
              >
                <div>
                  {/* Top row: Avatar + Name + Status Selector */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{r.name}</h4>
                        <p className="text-xs text-slate-400">
                          {r.role} • <span className="font-semibold text-slate-300">{r.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick status dropdown */}
                    <div className="relative">
                      <select
                        value={r.status}
                        disabled={updatingStatusId === r.id}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            r.id,
                            e.target.value as ReferralStatus
                          )
                        }
                        className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <option
                            key={key}
                            value={key}
                            className="bg-slate-900 text-white"
                          >
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Relationship & Linked Application tags */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300">
                      {r.relationship}
                    </span>

                    {r.applicationName && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                        <Briefcase className="h-3 w-3" />
                        {r.applicationName}
                      </span>
                    )}

                    {r.followUpDate && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                        <Calendar className="h-3 w-3" />
                        Follow-up:{" "}
                        {new Date(r.followUpDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Notes snippet if present */}
                  {r.notes && (
                    <p className="mt-3 rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs leading-relaxed text-slate-300">
                      {r.notes}
                    </p>
                  )}
                </div>

                {/* Footer Actions: LinkedIn, Email, Edit, Delete */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    {r.linkedinUrl ? (
                      <a
                        href={
                          r.linkedinUrl.startsWith("http")
                            ? r.linkedinUrl
                            : `https://${r.linkedinUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-400/20"
                      >
                        <LinkedinIcon className="h-3.5 w-3.5" />
                        Profile
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500">No LinkedIn</span>
                    )}

                    {r.email && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(r.email!, r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]"
                        title={r.email}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {copiedId === r.id ? "Copied!" : "Email"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openOutreachModal(r)}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20 shadow-glow"
                      title="Generate outreach message"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Pitch
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(r)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                      title="Edit contact"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === r.id}
                      onClick={() => handleDelete(r.id, r.name)}
                      className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                      title="Delete contact"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingReferral ? "Edit Contact" : "Add Networking Contact"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Target Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe, Google, Datadog"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Contact Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Staff Engineer, Recruiter"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Relationship
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={formLinkedinUrl}
                    onChange={(e) => setFormLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Outreach Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ReferralStatus)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={formFollowUpDate}
                    onChange={(e) => setFormFollowUpDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Link to Tracked Job Application
                </label>
                <select
                  value={formApplicationId}
                  onChange={(e) => setFormApplicationId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    -- No specific application linked --
                  </option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id} className="bg-slate-900 text-white">
                      {app.company} - {app.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Notes & Context
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Sent connection request asking about the new distributed systems team. Met at PyCon 2025."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {editingReferral ? "Save Changes" : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Outreach & LinkedIn Pitch Modal */}
      {isOutreachOpen && outreachContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Cold Outreach & Pitch Assistant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Drafting message for {outreachContact.name} ({outreachContact.role} at{" "}
                    <span className="font-semibold text-white">
                      {outreachContact.company}
                    </span>
                    )
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOutreachOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Template Selector */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Outreach Strategy
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      id: "LINKEDIN_NOTE",
                      label: "LinkedIn Note",
                      sub: "< 300 chars",
                    },
                    {
                      id: "COFFEE_CHAT",
                      label: "Coffee Chat",
                      sub: "15-min chat",
                    },
                    {
                      id: "RECRUITER_PITCH",
                      label: "Recruiter Pitch",
                      sub: "Headcount inquiry",
                    },
                    {
                      id: "FOLLOW_UP",
                      label: "Follow-Up",
                      sub: "Gentle bump",
                    },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setOutreachType(tpl.id as OutreachType);
                        setOutreachResult(null);
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                        outreachType === tpl.id
                          ? "border-purple-500 bg-purple-500/20 text-white font-bold shadow-glow"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-xs">{tpl.label}</span>
                      <span className="text-[10px] opacity-70">{tpl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Role You Are Seeking
                </label>
                <input
                  type="text"
                  value={targetRoleInput}
                  onChange={(e) => setTargetRoleInput(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                disabled={generatingOutreach}
                onClick={handleGenerateOutreach}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-glow transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {generatingOutreach ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synthesizing custom message...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Outreach Pitch
                  </>
                )}
              </button>
            </div>

            {/* Generated Output */}
            {outreachResult && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">
                        Generated Pitch
                      </p>
                      {outreachType === "LINKEDIN_NOTE" && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            outreachResult.characterCount <= 300
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {outreachResult.characterCount} / 300 chars (LinkedIn limit)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(outreachResult.message);
                          setCopiedOutreach(true);
                          setTimeout(() => setCopiedOutreach(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.1]"
                      >
                        {copiedOutreach ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Message
                          </>
                        )}
                      </button>

                      {outreachContact.linkedinUrl && (
                        <a
                          href={
                            outreachContact.linkedinUrl.startsWith("http")
                              ? outreachContact.linkedinUrl
                              : `https://${outreachContact.linkedinUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            navigator.clipboard.writeText(outreachResult.message);
                            setCopiedOutreach(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:bg-blue-500"
                        >
                          <LinkedinIcon className="h-3.5 w-3.5" />
                          Copy & Open LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  {outreachResult.subject && outreachType !== "LINKEDIN_NOTE" && (
                    <div className="mt-3 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Subject: </span>
                      {outreachResult.subject}
                    </div>
                  )}

                  <textarea
                    rows={outreachType === "LINKEDIN_NOTE" ? 3 : 7}
                    value={outreachResult.message}
                    onChange={(e) =>
                      setOutreachResult((prev) =>
                        prev
                          ? {
                              ...prev,
                              message: e.target.value,
                              characterCount: e.target.value.length,
                            }
                          : null
                      )
                    }
                    className="mt-3 w-full rounded-xl border border-white/5 bg-slate-900/60 p-3.5 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Tactical Tips */}
                {outreachResult.tips && outreachResult.tips.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Lightbulb className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Tactical Outreach Tip
                      </h4>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-amber-200/90">
                      {outreachResult.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-amber-400">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
