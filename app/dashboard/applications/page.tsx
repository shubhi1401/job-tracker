
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
      followUpDate: true,
      location: true,
    },
  });

  const applications = records.map((app) => ({
    ...app,
    applicationDate: app.applicationDate.toISOString(),
    followUpDate: app.followUpDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400">
            Manage and filter all your job applications.
          </p>
        </div>

        <Link
          href="/dashboard/applications/new"
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + Add Application
        </Link>
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  );
}
