import { sidebarLinks } from "@/lib/dashboard-data";

export function MobileDashboardNav() {
  return (
    <nav className="border-b border-white/10 bg-slate-950/60 px-5 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {sidebarLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              item.active
                ? "bg-blue-500 text-white"
                : "bg-white/[0.05] text-slate-300"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
