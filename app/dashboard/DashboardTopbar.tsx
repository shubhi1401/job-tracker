import { Bell, Search } from "lucide-react";

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight/80 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Welcome back</p>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search applications..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300/50 focus:ring-4 focus:ring-blue-500/15"
            />
          </div>

          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-blue-300/40 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-blue-400" />
          </button>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-black text-slate-950 shadow-glow"
            aria-label="User avatar"
          >
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
