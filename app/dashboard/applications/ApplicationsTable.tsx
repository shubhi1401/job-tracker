"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Columns3,
  Download,
  List,
  MapPin,
  Sparkles,
} from "lucide-react";
import DeleteApplicationButton from "./DeleteApplicationButton";

type Application = {
  id: number;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  applicationDate: string;
  interviewDate?: string | null;
  followUpDate?: string | null;
  followUpCompleted?: boolean;
  location: string;
  salary?: string | null;
  jobUrl?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  notes?: string | null;
};

type Filter = "ALL" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | "OVERDUE";

const KANBAN_COLUMNS: {
  id: Application["status"];
  label: string;
  color: string;
  badgeBg: string;
}[] = [
  {
    id: "APPLIED",
    label: "Applied",
    color: "text-cyan-300",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-200",
  },
  {
    id: "INTERVIEW",
    label: "Interview",
    color: "text-blue-300",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-200",
  },
  {
    id: "OFFER",
    label: "Offer",
    color: "text-emerald-300",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
  },
  {
    id: "REJECTED",
    label: "Rejected",
    color: "text-rose-300",
    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-200",
  },
];

export default function ApplicationsTable({
  applications: initialApplications,
}: {
  applications: Application[];
}) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredApplications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase()) ||
        app.location.toLowerCase().includes(search.toLowerCase());

      const isOverdue =
        !app.followUpCompleted &&
        app.followUpDate !== null &&
        app.followUpDate !== undefined &&
        new Date(app.followUpDate).setHours(0, 0, 0, 0) < today.getTime();

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "OVERDUE"
            ? isOverdue && app.status !== "OFFER" && app.status !== "REJECTED"
            : app.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, filter, search]);

  async function handleStatusChange(
    applicationId: number,
    newStatus: Application["status"]
  ) {
    setUpdatingId(applicationId);

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      // Revert on error
      setApplications(initialApplications);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleExportCSV() {
    const headers = [
      "Company",
      "Role",
      "Location",
      "Status",
      "Salary",
      "Application Date",
      "Interview Date",
      "Follow-up Date",
      "Follow-up Completed",
      "Recruiter Name",
      "Recruiter Email",
      "Job URL",
      "Notes",
    ];

    const escapeCSV = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredApplications.map((app) => [
      escapeCSV(app.company),
      escapeCSV(app.role),
      escapeCSV(app.location),
      escapeCSV(app.status),
      escapeCSV(app.salary),
      escapeCSV(new Date(app.applicationDate).toLocaleDateString()),
      escapeCSV(app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : ""),
      escapeCSV(app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : ""),
      escapeCSV(app.followUpCompleted ? "Yes" : "No"),
      escapeCSV(app.recruiterName),
      escapeCSV(app.recruiterEmail),
      escapeCSV(app.jobUrl),
      escapeCSV(app.notes),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobtracker-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Search, Filter, View Toggles & Export Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or location..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 sm:max-w-md"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="ALL">All Applications</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="OVERDUE">Overdue Follow-ups</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Kanban view toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/80 p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>

            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredApplications.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            title="Download CSV export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnApps = filteredApplications.filter(
              (app) => app.status === column.id
            );

            return (
              <div
                key={column.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        column.id === "APPLIED"
                          ? "bg-cyan-400"
                          : column.id === "INTERVIEW"
                            ? "bg-blue-400"
                            : column.id === "OFFER"
                              ? "bg-emerald-400"
                              : "bg-rose-400"
                      }`}
                    />
                    <h3 className="font-bold text-white text-sm">
                      {column.label}
                    </h3>
                  </div>

                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                    {columnApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
                  {columnApps.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
                      No applications in this stage
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        className="group relative rounded-xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-blue-400/50 hover:bg-slate-950 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">
                              {app.company}
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              {app.role}
                            </p>
                          </div>

                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-xs font-bold text-blue-300">
                            {app.company[0]}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {app.location}
                          </span>

                          {app.salary && (
                            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-semibold text-emerald-300">
                              {app.salary}
                            </span>
                          )}
                        </div>

                        {/* Interview or Follow-up Notice */}
                        {app.interviewDate && (
                          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-cyan-300 bg-cyan-500/10 rounded-lg p-1.5">
                            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              Interview:{" "}
                              {new Date(app.interviewDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Note preview snippet */}
                        {app.notes && (
                          <p className="mt-2.5 line-clamp-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[11px] leading-relaxed text-slate-400">
                            {app.notes}
                          </p>
                        )}

                        {/* Card footer: quick stage changer & actions */}
                        <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                          <select
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) =>
                              void handleStatusChange(
                                app.id,
                                e.target.value as Application["status"]
                              )
                            }
                            className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-300 outline-none hover:border-blue-400"
                            title="Move to another stage"
                          >
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/applications/${app.id}`}
                              className="text-blue-300 hover:text-blue-200 font-semibold text-xs"
                            >
                              View
                            </Link>
                            <Link
                              href={`/dashboard/applications/${app.id}/edit`}
                              className="text-slate-400 hover:text-white font-semibold text-xs"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Application Date</th>
                <th className="p-4">Follow-up Date</th>
                <th className="p-4">Location</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/15 text-xs font-bold text-blue-300">
                        {app.company[0]}
                      </div>
                      <span className="font-semibold">{app.company}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{app.role}</td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) =>
                        void handleStatusChange(
                          app.id,
                          e.target.value as Application["status"]
                        )
                      }
                      className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 outline-none hover:border-blue-400"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-300">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-300">
                    {app.followUpDate ? (
                      <div className="flex items-center gap-2">
                        <span>{new Date(app.followUpDate).toLocaleDateString()}</span>
                        {app.followUpCompleted && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                            Done
                          </span>
                        )}
                      </div>
                    ) : (
                      "Not scheduled"
                    )}
                  </td>
                  <td className="p-4 text-slate-300">{app.location}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="font-semibold text-blue-300 hover:text-blue-200"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/applications/${app.id}/edit`}
                        className="font-semibold text-blue-300 hover:text-blue-200"
                      >
                        Edit
                      </Link>
                      <DeleteApplicationButton id={app.id} />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No applications match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-slate-400">
        Showing {filteredApplications.length} of {applications.length} applications
      </p>
    </div>
  );
}
