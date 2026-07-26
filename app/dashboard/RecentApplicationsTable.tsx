import { recentApplications } from "@/lib/dashboard-data";
const statusStyles: Record<string, string> = {
  Interview: "bg-blue-400/10 text-blue-200",
  Applied: "bg-cyan-400/10 text-cyan-200",
  Offer: "bg-emerald-400/10 text-emerald-200",
  Rejected: "bg-rose-400/10 text-rose-200"
};
export function RecentApplicationsTable() {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Recent Applications</h2>
          <p className="text-sm text-slate-400">
            Latest roles added to your job pipeline.
          </p>
        </div>
        <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-blue-300/40 hover:text-white">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
              <th className="pb-4 font-semibold">Company</th>
              <th className="pb-4 font-semibold">Role</th>
              <th className="pb-4 font-semibold">Date</th>
              <th className="pb-4 font-semibold">Status</th>
              <th className="pb-4 font-semibold">Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {recentApplications.map((application) => (
              <tr key={`${application.company}-${application.role}`}>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 font-bold text-blue-200">
                      {application.company[0]}
                    </div>
                    <span className="font-semibold text-white">
                      {application.company}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-slate-300">{application.role}</td>
                <td className="py-4 text-slate-400">{application.date}</td>
                <td className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusStyles[application.status]
                    }`}
                  >
                    {application.status}
                  </span>
                </td>
                <td className="py-4 font-bold text-blue-200">
                  {application.match}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}