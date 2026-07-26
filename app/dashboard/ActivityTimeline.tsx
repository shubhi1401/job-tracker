import { activityTimeline } from "@/lib/dashboard-data";
export function ActivityTimeline() {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">Activity Timeline</h2>
        <p className="text-sm text-slate-400">
          Recent AI insights and pipeline updates.
        </p>
      </div>
      <div className="relative space-y-6 pl-6">
        <div className="absolute left-2 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-blue-400 via-blue-500/40 to-transparent" />
        {activityTimeline.map((activity) => (
          <article key={activity.title} className="relative">
            <span className="absolute -left-[1.35rem] top-1 h-4 w-4 rounded-full border-4 border-slate-950 bg-blue-400 shadow-glow" />
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-bold text-white">{activity.title}</h3>
                <span className="text-xs font-semibold text-blue-200">
                  {activity.time}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {activity.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}