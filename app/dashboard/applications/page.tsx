import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApplicationsTable from "./ApplicationsTable";

export const metadata: Metadata = {
  title: "Applications | JobTracker AI",
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const records = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      company: true,
      role: true,
      status: true,
      applicationDate: true,
      interviewDate: true,
      followUpDate: true,
      followUpCompleted: true,
      location: true,
      salary: true,
      jobUrl: true,
      recruiterName: true,
      recruiterEmail: true,
      notes: true,
    },
  });

  const applications = records.map((app) => ({
    ...app,
    applicationDate: app.applicationDate.toISOString(),
    interviewDate: app.interviewDate?.toISOString() ?? null,
    followUpDate: app.followUpDate?.toISOString() ?? null,
    followUpCompleted: app.followUpCompleted,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Applications</h1>
          <p className="mt-1 text-slate-400">
            Track, filter, and manage your pipeline across table and kanban views.
          </p>
        </div>

        <Link
          href="/dashboard/applications/new"
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-glow transition hover:bg-blue-500"
        >
          + Add Application
        </Link>
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  );
}
