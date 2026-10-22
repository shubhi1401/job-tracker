
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const applicationId = Number(id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    notFound();
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: user.id },
  });

  if (!application) notFound();

  const fields = [
    ["Company", application.company],
    ["Role", application.role],
    ["Status", application.status],
    ["Location", application.location],
    ["Salary", application.salary],
    ["Recruiter Name", application.recruiterName],
    ["Recruiter Email", application.recruiterEmail],
    ["Application Date", application.applicationDate.toLocaleDateString()],
    [
      "Follow-up Date",
      application.followUpDate?.toLocaleDateString() ?? "Not scheduled",
    ],
    [
      "Interview Date",
      application.interviewDate?.toLocaleDateString() ?? "Not scheduled",
    ],
    ["Job URL", application.jobUrl],
    ["Notes", application.notes],
    [
      "Follow-up Completed",
      application.followUpCompleted ? "Yes" : "No",
    ],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/applications"
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          ← Back to Applications
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">
          Application Details
        </h1>
        <p className="mt-2 text-slate-400">
          Review your saved application information.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0 space-y-1">
            <p className="text-sm text-slate-400">{label}</p>
            {label === "Job URL" && value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-300 hover:underline"
              >
                Open job posting
              </a>
            ) : (
              <p className="break-words font-medium text-white">
                {value || "Not provided"}
              </p>
            )}
          </div>
        ))}
      </div>

      <Link
        href={`/dashboard/applications/${application.id}/edit`}
        className="inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Edit Application
      </Link>
    </div>
  );
}
