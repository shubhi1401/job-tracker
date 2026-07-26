import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { DashboardSidebar } from "@/app/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/app/dashboard/DashboardTopbar";
import { MobileDashboardNav } from "@/app/dashboard/MobileDashboardNav";

type DashboardPlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function DashboardPlaceholder({
  title,
  description,
  icon: Icon
}: DashboardPlaceholderProps) {
  return (
    <main className="min-h-screen bg-midnight text-white">
      <div className="flex">
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <DashboardTopbar />
          <MobileDashboardNav />

          <section className="p-5 sm:p-8">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl shadow-blue-950/40 backdrop-blur">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-500/15 text-blue-300">
                <Icon className="h-8 w-8" />
              </div>

              <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {title}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
                {description}
              </p>

              <a
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
