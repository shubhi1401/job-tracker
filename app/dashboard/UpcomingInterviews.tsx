import { CalendarClock } from "lucide-react";
import { upcomingInterviews } from "@/lib/dashboard-data";
export function UpcomingInterviews() {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">Upcoming Interviews</h2>
        <p className="text-sm text-slate-400">Your next scheduled rounds.</p>
      </div>
      <div className="space-y-3">
        {upcomingInterviews.map((interview) => (
          <article
            key={`${interview.company}-${interview.time}`}
            className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-blue-300/40"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">{interview.company}</h3>
                <p className="text-sm text-slate-400">{interview.role}</p>
                <p className="mt-2 text-sm font-semibold text-blue-200">
                  {interview.time}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
