"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Edit2,
  ExternalLink,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react";
import type { Offer, OfferStatus, WorkModel } from "@/lib/offers-storage";

type ApplicationOption = {
  id: number;
  company: string;
  role: string;
};

type NegotiationResult = {
  recommendedBase: number;
  recommendedSignOn: number;
  recommendedEquity: number;
  currentFirstYearTC: number;
  emailSubject: string;
  emailBody: string;
  strategicPointers: string[];
  phoneScript: string;
};

const WORK_MODELS: { value: WorkModel; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  EXPLORING: {
    label: "Under Review",
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    border: "border-blue-500/20",
  },
  NEGOTIATING: {
    label: "Negotiating",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
  },
  DECLINED: {
    label: "Declined",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function OffersClient({
  initialOffers,
  applications,
}: {
  initialOffers: Offer[];
  applications: ApplicationOption[];
}) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form state
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formWorkModel, setFormWorkModel] = useState<WorkModel>("REMOTE");
  const [formBaseSalary, setFormBaseSalary] = useState("");
  const [formBonusPercent, setFormBonusPercent] = useState("");
  const [formStockPerYear, setFormStockPerYear] = useState("");
  const [formSignOnBonus, setFormSignOnBonus] = useState("");
  const [formMatch401k, setFormMatch401k] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formStatus, setFormStatus] = useState<OfferStatus>("EXPLORING");
  const [formApplicationId, setFormApplicationId] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // AI Negotiation Assistant state
  const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);
  const [negotiatingOffer, setNegotiatingOffer] = useState<Offer | null>(null);
  const [targetBaseInput, setTargetBaseInput] = useState("");
  const [competingOfferInput, setCompetingOfferInput] = useState("");
  const [priorityInput, setPriorityInput] = useState<
    "BASE_SALARY" | "SIGN_ON" | "EQUITY" | "REMOTE_FLEXIBILITY"
  >("BASE_SALARY");
  const [toneInput, setToneInput] = useState<
    "COLLABORATIVE" | "CONFIDENT" | "EXCITED"
  >("COLLABORATIVE");

  const [generatingNegotiation, setGeneratingNegotiation] = useState(false);
  const [negotiationResult, setNegotiationResult] =
    useState<NegotiationResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Top Metrics
  const metrics = useMemo(() => {
    const total = offers.length;
    const topOffer = offers.reduce(
      (max, o) => (o.firstYearTotal > max ? o.firstYearTotal : max),
      0
    );
    const highestBase = offers.reduce(
      (max, o) => (o.baseSalary > max ? o.baseSalary : max),
      0
    );
    const negotiatingCount = offers.filter((o) => o.status === "NEGOTIATING").length;

    return { total, topOffer, highestBase, negotiatingCount };
  }, [offers]);

  function openCreateModal() {
    setEditingOffer(null);
    setFormCompany("");
    setFormRole("");
    setFormLocation("");
    setFormWorkModel("REMOTE");
    setFormBaseSalary("");
    setFormBonusPercent("");
    setFormStockPerYear("");
    setFormSignOnBonus("");
    setFormMatch401k("");
    setFormDeadline("");
    setFormStatus("EXPLORING");
    setFormApplicationId("");
    setFormNotes("");
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(offer: Offer) {
    setEditingOffer(offer);
    setFormCompany(offer.company);
    setFormRole(offer.role);
    setFormLocation(offer.location);
    setFormWorkModel(offer.workModel);
    setFormBaseSalary(String(offer.baseSalary));
    setFormBonusPercent(offer.bonusPercent ? String(offer.bonusPercent) : "");
    setFormStockPerYear(offer.stockPerYear ? String(offer.stockPerYear) : "");
    setFormSignOnBonus(offer.signOnBonus ? String(offer.signOnBonus) : "");
    setFormMatch401k(
      offer.match401kPercent ? String(offer.match401kPercent) : ""
    );
    setFormDeadline(offer.deadlineDate ? offer.deadlineDate.split("T")[0] : "");
    setFormStatus(offer.status);
    setFormApplicationId(
      offer.applicationId ? String(offer.applicationId) : ""
    );
    setFormNotes(offer.notes || "");
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingOffer(null);
    setError("");
  }

  async function handleSaveOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim() || !formLocation.trim()) {
      setError("Please fill company, role, and location.");
      return;
    }

    const base = Number(formBaseSalary);
    if (isNaN(base) || base <= 0) {
      setError("Please enter a valid base salary.");
      return;
    }

    setSaving(true);
    setError("");

    const selectedApp = applications.find(
      (a) => String(a.id) === formApplicationId
    );

    const payload = {
      company: formCompany.trim(),
      role: formRole.trim(),
      location: formLocation.trim(),
      workModel: formWorkModel,
      baseSalary: base,
      bonusPercent: Number(formBonusPercent) || 0,
      stockPerYear: Number(formStockPerYear) || 0,
      signOnBonus: Number(formSignOnBonus) || 0,
      match401kPercent: Number(formMatch401k) || 0,
      deadlineDate: formDeadline ? new Date(formDeadline).toISOString() : null,
      status: formStatus,
      applicationId: selectedApp ? selectedApp.id : null,
      applicationName: selectedApp
        ? `${selectedApp.company} - ${selectedApp.role}`
        : null,
      notes: formNotes.trim(),
    };

    try {
      if (editingOffer) {
        const res = await fetch(`/api/offers/${editingOffer.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update offer.");

        setOffers((prev) =>
          prev.map((o) => (o.id === editingOffer.id ? data : o))
        );
      } else {
        const res = await fetch("/api/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add offer.");

        setOffers((prev) => [data, ...prev].sort((a, b) => b.firstYearTotal - a.firstYearTotal));
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, company: string) {
    if (!window.confirm(`Delete offer from ${company}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete offer.");
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  // Open negotiation assistant for an offer
  function openNegotiationAssistant(offer: Offer) {
    setNegotiatingOffer(offer);
    const suggestedBase = Math.round((offer.baseSalary * 1.1) / 1000) * 1000;
    setTargetBaseInput(String(suggestedBase));
    setCompetingOfferInput("");
    setPriorityInput("BASE_SALARY");
    setToneInput("COLLABORATIVE");
    setNegotiationResult(null);
    setIsNegotiateOpen(true);
  }

  async function handleGenerateNegotiation() {
    if (!negotiatingOffer) return;

    setGeneratingNegotiation(true);
    try {
      const res = await fetch("/api/offers/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: negotiatingOffer.company,
          role: negotiatingOffer.role,
          baseSalary: negotiatingOffer.baseSalary,
          bonusPercent: negotiatingOffer.bonusPercent,
          stockPerYear: negotiatingOffer.stockPerYear,
          signOnBonus: negotiatingOffer.signOnBonus,
          targetBase: Number(targetBaseInput) || undefined,
          competingOffer: competingOfferInput,
          priority: priorityInput,
          tone: toneInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate strategy.");

      setNegotiationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingNegotiation(false);
    }
  }

  function copyText(text: string, section: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-glow backdrop-blur">
            <Coins className="h-3.5 w-3.5" />
            Total Compensation & Negotiation
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Offer Evaluator & Negotiation
          </h1>
          <p className="mt-2 text-slate-400">
            Compare packages side-by-side (Base, Bonus, Equity, Sign-on) and craft high-leverage counteroffers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Offer
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Active Offers
          </p>
          <p className="mt-3 text-3xl font-bold text-white">{metrics.total}</p>
          <p className="mt-1 text-xs text-slate-400">Packages being evaluated</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Top 1st-Year Total Comp
          </p>
          <p className="mt-3 text-3xl font-bold text-emerald-300">
            {metrics.topOffer > 0 ? formatCurrency(metrics.topOffer) : "$0"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Base + Bonus + Equity + Sign-on</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Highest Base Salary
          </p>
          <p className="mt-3 text-3xl font-bold text-blue-300">
            {metrics.highestBase > 0 ? formatCurrency(metrics.highestBase) : "$0"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Guaranteed annual baseline</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Negotiations In Flight
          </p>
          <p className="mt-3 text-3xl font-bold text-amber-300">
            {metrics.negotiatingCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Counteroffers submitted</p>
        </div>
      </div>

      {/* Offers Comparison Cards */}
      {offers.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
          <Coins className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-bold text-white">
            No job offers added yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Add offers you've received or are expecting. Compare annualized equity, sign-on bonuses, and generate negotiation scripts to maximize your compensation.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add First Offer
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {offers.map((offer) => {
            const statusInfo = STATUS_CONFIG[offer.status];
            const bonusDollar = Math.round(
              offer.baseSalary * (offer.bonusPercent / 100)
            );

            return (
              <div
                key={offer.id}
                className="flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20"
              >
                <div>
                  {/* Top Bar: Company, Role, Work Model, Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">
                          {offer.company}
                        </h3>
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                          {offer.workModel}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {offer.role} • {offer.location}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Primary Highlight: 1st Year Total Comp */}
                  <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      1st Year Total Compensation (TC)
                    </p>
                    <div className="mt-1 flex items-baseline justify-between">
                      <p className="text-3xl font-black text-white">
                        {formatCurrency(offer.firstYearTotal)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Recurring:{" "}
                        <span className="font-semibold text-slate-200">
                          {formatCurrency(offer.recurringAnnualTotal)}/yr
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Compensation Breakdown Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <p className="text-slate-400">Base Salary</p>
                      <p className="mt-1 font-bold text-white">
                        {formatCurrency(offer.baseSalary)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <p className="text-slate-400">
                        Bonus ({offer.bonusPercent}%)
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {formatCurrency(bonusDollar)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <p className="text-slate-400">Equity / Yr</p>
                      <p className="mt-1 font-bold text-white">
                        {formatCurrency(offer.stockPerYear)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                      <p className="text-slate-400">Sign-on (1st yr)</p>
                      <p className="mt-1 font-bold text-white">
                        {formatCurrency(offer.signOnBonus)}
                      </p>
                    </div>
                  </div>

                  {/* Extra Details: 401k, Deadline, Linked App */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {offer.match401kPercent > 0 && (
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300">
                        401(k) Match: {offer.match401kPercent}%
                      </span>
                    )}

                    {offer.deadlineDate && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                        <Calendar className="h-3 w-3" />
                        Deadline:{" "}
                        {new Date(offer.deadlineDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}

                    {offer.applicationName && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                        <Briefcase className="h-3 w-3" />
                        {offer.applicationName}
                      </span>
                    )}
                  </div>

                  {offer.notes && (
                    <p className="mt-3 rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs leading-relaxed text-slate-300">
                      {offer.notes}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => openNegotiationAssistant(offer)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-glow transition hover:bg-emerald-500/20"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    AI Negotiate & Counter
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(offer)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                      title="Edit offer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === offer.id}
                      onClick={() => handleDelete(offer.id, offer.company)}
                      className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                      title="Delete offer"
                    >
                      {deletingId === offer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingOffer ? "Edit Offer" : "Add Job Offer"}
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

            <form onSubmit={handleSaveOffer} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe, Airbnb"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA / Remote"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Work Model
                  </label>
                  <select
                    value={formWorkModel}
                    onChange={(e) => setFormWorkModel(e.target.value as WorkModel)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {WORK_MODELS.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Base Salary ($ / year) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(e.target.value)}
                    placeholder="160000"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Target Bonus (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formBonusPercent}
                    onChange={(e) => setFormBonusPercent(e.target.value)}
                    placeholder="10"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Equity / Stock ($ / year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formStockPerYear}
                    onChange={(e) => setFormStockPerYear(e.target.value)}
                    placeholder="40000"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sign-on Bonus ($ one-time)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSignOnBonus}
                    onChange={(e) => setFormSignOnBonus(e.target.value)}
                    placeholder="15000"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    401(k) Match (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formMatch401k}
                    onChange={(e) => setFormMatch401k(e.target.value)}
                    placeholder="4"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Offer Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OfferStatus)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                      <option key={k} value={k} className="bg-slate-900 text-white">
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Decision Deadline
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
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
                  Notes & Perks
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Unlimited PTO, $1,500 home office stipend, health insurance 100% covered."
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
                  {editingOffer ? "Save Changes" : "Save Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Counteroffer & Negotiation Assistant Modal */}
      {isNegotiateOpen && negotiatingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    AI Counteroffer & Negotiation Assistant
                  </h3>
                  <p className="text-xs text-slate-400">
                    Negotiating offer for {negotiatingOffer.role} at{" "}
                    <span className="font-semibold text-white">
                      {negotiatingOffer.company}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNegotiateOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Negotiation Parameters */}
            <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Base Salary ($)
                </label>
                <input
                  type="number"
                  value={targetBaseInput}
                  onChange={(e) => setTargetBaseInput(e.target.value)}
                  placeholder="e.g. 185000"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Primary Leverage Focus
                </label>
                <select
                  value={priorityInput}
                  onChange={(e) =>
                    setPriorityInput(
                      e.target.value as
                        | "BASE_SALARY"
                        | "SIGN_ON"
                        | "EQUITY"
                        | "REMOTE_FLEXIBILITY"
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="BASE_SALARY" className="bg-slate-900 text-white">
                    Base Salary Priority
                  </option>
                  <option value="SIGN_ON" className="bg-slate-900 text-white">
                    Sign-on Bonus (Highest Recruiter Leeway)
                  </option>
                  <option value="EQUITY" className="bg-slate-900 text-white">
                    Equity / RSUs Priority
                  </option>
                  <option value="REMOTE_FLEXIBILITY" className="bg-slate-900 text-white">
                    Remote Work Flexibility
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Competing Offer Leverage (Optional)
                </label>
                <input
                  type="text"
                  value={competingOfferInput}
                  onChange={(e) => setCompetingOfferInput(e.target.value)}
                  placeholder="e.g. Google offering $190k base + $50k equity"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Negotiation Tone
                </label>
                <select
                  value={toneInput}
                  onChange={(e) =>
                    setToneInput(
                      e.target.value as
                        | "COLLABORATIVE"
                        | "CONFIDENT"
                        | "EXCITED"
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="COLLABORATIVE" className="bg-slate-900 text-white">
                    Collaborative & Polished
                  </option>
                  <option value="CONFIDENT" className="bg-slate-900 text-white">
                    Confident & Direct
                  </option>
                  <option value="EXCITED" className="bg-slate-900 text-white">
                    Enthusiastic & High-Affinity
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  disabled={generatingNegotiation}
                  onClick={handleGenerateNegotiation}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-glow transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
                >
                  {generatingNegotiation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing compensation & drafting strategy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Counteroffer Email & Phone Script
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Output */}
            {negotiationResult && (
              <div className="mt-6 space-y-6">
                {/* Tactical Tips */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Lightbulb className="h-4 w-4" />
                    <h4 className="font-bold">Strategic Leverage Points</h4>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-amber-200/90">
                    {negotiationResult.strategicPointers.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-amber-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Email Draft */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Subject:
                      </p>
                      <p className="font-semibold text-white">
                        {negotiationResult.emailSubject}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(negotiationResult.emailBody, "email")
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.1]"
                    >
                      {copiedSection === "email" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Email
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-900/60 p-4 font-mono text-xs leading-relaxed text-slate-200">
                    {negotiationResult.emailBody}
                  </div>
                </div>

                {/* Recruiter Phone Call Script */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-white">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                      <h4 className="font-bold">Phone Call Verbal Script</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(negotiationResult.phoneScript, "phone")
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.1]"
                    >
                      {copiedSection === "phone" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Script
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-900/60 p-4 font-mono text-xs leading-relaxed text-slate-300">
                    {negotiationResult.phoneScript}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
