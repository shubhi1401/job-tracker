
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Trophy,
  XCircle,
} from "lucide-react";

export async function StatsGrid() {
  const user = await getCurrentUser();

  if (!user) return null;

  const [total, interviews, offers, rejections] = await Promise.all([
    prisma.application.count({
      where: { userId: user.id },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "INTERVIEW" },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "OFFER" },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "REJECTED" },
    }),
  ]);

  const stats = [
    {
      label: "Total Applications",
      value: total,
      description: "Applications tracked",
      icon: BriefcaseBusiness,
      color: "text-cyan-300",
      background: "bg-cyan-400/10",
    },
    {
      label: "Interviews",
      value: interviews,
      description: "Interview-stage applications",
      icon: CalendarCheck,
      color: "text-blue-300",
      background: "bg-blue-400/10",
    },
    {
      label: "Offers",
      value: offers,
      description: "Offers received",
      icon: Trophy,
      color: "text-emerald-300",
      background: "bg-emerald-400/10",
    },
    {
      label: "Rejections",
      value: rejections,
      description: "Rejected applications",
      icon: XCircle,
      color: "text-rose-300",
      background: "bg-rose-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">
                {stat.label}
              </p>

              <div className={`rounded-xl p-2 ${stat.background}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-black text-white">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
