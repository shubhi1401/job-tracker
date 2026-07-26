import { dashboardStats } from "@/lib/dashboard-data";
import { StatCard } from "@/app/dashboard/StatCard";

export function StatsGrid() {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}
