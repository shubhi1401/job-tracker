
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeleteApplicationButton from "./DeleteApplicationButton";

type Application = {
  id: number;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  applicationDate: string;
  followUpDate: string | null;
  location: string;
};

type Filter = "ALL" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | "OVERDUE";

export default function ApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  const filteredApplications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());

      const isOverdue =
        app.followUpDate !== null &&
        new Date(app.followUpDate).setHours(0, 0, 0, 0) < today.getTime();

      const matchesFilter =
        filter === "ALL" ||
        filter === "OVERDUE"
          ? filter === "ALL" || (isOverdue && app.status !== "OFFER" && app.status !== "REJECTED")
          : app.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company or role..."
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-400"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
        >
          <option value="ALL">All Applications</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
          <option value="OVERDUE">Overdue Follow-ups</option>
        </select>
      </div>

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
                <td className="p-4 text-white">{app.company}</td>
                <td className="p-4 text-slate-300">{app.role}</td>
                <td className="p-4 text-slate-300">{app.status}</td>
                <td className="p-4 text-slate-300">
                  {new Date(app.applicationDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-slate-300">
                  {app.followUpDate
                    ? new Date(app.followUpDate).toLocaleDateString()
                    : "Not scheduled"}
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

      <p className="text-sm text-slate-400">
        Showing {filteredApplications.length} of {applications.length} applications
      </p>
    </div>
  );
}
