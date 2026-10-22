
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  StatusPieChart,
  MonthlyBarChart,
} from "./AnalyticsCharts";

export const metadata: Metadata = {
  title: "Analytics | JobTracker AI",
};

const statusColors: Record<string, string> = {
  APPLIED: "#60a5fa",
  INTERVIEW: "#fbbf24",
  OFFER: "#4ade80",
  REJECTED: "#f87171",
};

const statusLabels: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
    },
    select: {
      status: true,
      applicationDate: true,
    },
  });

  const total = applications.length;

  const interviews = applications.filter(
    (app) => app.status === "INTERVIEW"
  ).length;

  const offers = applications.filter(
    (app) => app.status === "OFFER"
  ).length;

  const interviewRate =
    total > 0 ? Math.round((interviews / total) * 100) : 0;

  const offerRate =
    total > 0 ? Math.round((offers / total) * 100) : 0;

  const statuses = [
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const statusData = statuses.map((status) => ({
    name: statusLabels[status],
    count: applications.filter(
      (app) => app.status === status
    ).length,
    fill: statusColors[status],
  }));

  const now = new Date();

  const monthlyData = Array.from(
    { length: 6 },
    (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      );

      const count = applications.filter(
        (app) =>
          app.applicationDate >= monthDate &&
          app.applicationDate < nextMonth
      ).length;

      return {
        month: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        applications: count,
      };
    }
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Analytics
        </h1>
        <p className="mt-2 text-slate-400">
          Understand your job search progress and
          application outcomes.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Applications"
          value={String(total)}
          description="All recorded applications"
        />

        <MetricCard
          title="Interviews"
          value={String(interviews)}
          description="Currently in Interview status"
        />

        <MetricCard
          title="Interview Rate"
          value={`${interviewRate}%`}
          description="Interview status / total applications"
        />

        <MetricCard
          title="Offer Rate"
          value={`${offerRate}%`}
          description="Offer status / total applications"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Status Pie Chart */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">
            Applications by Status
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Distribution of your recorded applications
          </p>

          <StatusPieChart data={statusData} />
        </section>

        {/* Monthly Bar Chart */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">
            Monthly Application Trend
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Applications submitted over the last six
            calendar months
          </p>

          <MonthlyBarChart data={monthlyData} />
        </section>
      </div>

      {/* Status Summary */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-lg font-semibold text-white">
          Status Summary
        </h2>

        <div className="mt-4 space-y-5">
          {statusData.map((item) => {
            const percentage =
              total > 0
                ? Math.round(
                    (item.count / total) * 100
                  )
                : 0;

            return (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">
                    {item.name}
                  </span>

                  <span className="text-sm text-slate-400">
                    {item.count} ({percentage}%)
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
