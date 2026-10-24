"use client";

import { BriefcaseBusiness, LogOut } from "lucide-react";
import { sidebarLinks } from "@/lib/dashboard-data";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:flex lg:flex-col">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 shadow-glow">
          <BriefcaseBusiness className="h-5 w-5 text-white" />
        </span>

        <span className="text-lg font-black tracking-tight text-white">
          JobTracker <span className="text-blue-300">AI</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-300 ${
                isActive
                  ? "bg-blue-500 text-white shadow-glow"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-white/10 pt-4">
        {logoutError && (
          <p className="mb-3 text-sm text-rose-300">{logoutError}</p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
