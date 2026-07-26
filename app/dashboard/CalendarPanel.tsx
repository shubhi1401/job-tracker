import { calendarDates, calendarDays } from "@/lib/dashboard-data";

export function CalendarPanel() {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">Calendar</h2>
        <p className="text-sm text-slate-400">June 2026</p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {calendarDays.map((day) => (
          <span key={day} className="text-xs font-bold text-slate-500">
            {day}
          </span>
        ))}

        {calendarDates.map((date) => {
          const isHighlighted = [8, 18, 24, 26].includes(date);

          return (
            <button
              key={date}
              type="button"
              className={`aspect-square rounded-xl text-sm font-semibold transition ${
                isHighlighted
                  ? "bg-blue-500 text-white shadow-glow"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {date}
            </button>
          );
        })}
      </div>
    </section>
  );
}
