import { BriefcaseBusiness } from "lucide-react";
import { sidebarLinks } from "@/lib/dashboard-data";
export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:block">
      <a href="/" className="mb-10 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 shadow-glow">
          <BriefcaseBusiness className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-black tracking-tight text-white">
          JobTracker <span className="text-blue-300">AI</span>
        </span>
      </a>
      <nav className="space-y-2">
        {sidebarLinks.map((item) => ( 
          <a
            key={item.label}
            href={item.href}
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-300 ${
              item.active
                ? "bg-blue-500 text-white shadow-glow"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
