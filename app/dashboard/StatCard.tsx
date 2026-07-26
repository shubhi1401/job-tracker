import type { LucideIcon } from "lucide-react";
type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
};
export function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
            {value}
          </h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-blue-200">{change}</p>
    </article>
  );
}
