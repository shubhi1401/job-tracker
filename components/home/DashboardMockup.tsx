import {
  ArrowUpRight,
  CalendarCheck,
  CircleDot,
  FileText,
  MoreHorizontal
} from "lucide-react";

const recentApplications = [
  { company: "Google", role: "Frontend Engineer", status: "Interview" },
  { company: "Adobe", role: "React Developer", status: "Applied" },
  { company: "Atlassian", role: "UI Engineer", status: "Offer" }
];

export function DashboardMockup() {
  return (
    <a
      id="demo"
      href="/dashboard"
      aria-label="Open full dashboard demo"
      className="relative mx-auto w-full max-w-2xl animate-float-slow rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-blue-950/50 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/30 blur-2xl" />
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Dashboard</p>
            <h2 className="text-2xl font-bold text-white">Career Pipeline</h2>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Applications", value: "128", icon: FileText },
            { label: "Interview Rate", value: "42%", icon: CalendarCheck },
            { label: "Offer Rate", value: "18%", icon: ArrowUpRight }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"
            >
              <item.icon className="mb-4 h-5 w-5 text-blue-300" />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Applications</h3>
              <span className="text-xs text-blue-300">Live</span>
            </div>
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.company}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3"
                >
                  <div>
                    <p className="font-medium text-white">{app.company}</p>
                    <p className="text-xs text-slate-400">{app.role}</p>
                  </div>
                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-200">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-400/5 p-4">
            <h3 className="font-semibold text-white">Analytics</h3>
            <div className="mt-5 flex h-36 items-end gap-2">
              {[42, 68, 54, 82, 73, 92, 78].map((height, index) => (
                <div
                  key={height + index}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
              <CircleDot className="h-4 w-4 text-cyan-300" />
              Interview momentum up 24%
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
