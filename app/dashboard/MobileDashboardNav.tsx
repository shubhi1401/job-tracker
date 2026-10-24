"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/lib/dashboard-data";

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-slate-950/60 px-5 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {sidebarLinks.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-500 text-white shadow-glow"
                  : "bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
