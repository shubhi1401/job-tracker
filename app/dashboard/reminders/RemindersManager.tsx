
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReminderApplication = {
  id: number;
  company: string;
  role: string;
  status: string;
  applicationDate: string;
  interviewDate: string | null;
  followUpDate: string | null;
  followUpCompleted: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isOverdue(value: string | null, completed = false) {
  return (
    Boolean(value) &&
    !completed &&
    new Date(value as string).getTime() < Date.now()
  );
}

export default function RemindersManager() {
  const [applications, setApplications] = useState<
    ReminderApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadReminders() {
    setError("");

    try {
      const response = await fetch("/api/reminders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load reminders.");
      }

      setApplications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load reminders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReminders();
  }, []);

  async function toggleFollowUp(
    application: ReminderApplication
  ) {
    setError("");
    setUpdatingId(application.id);

    const completed = !application.followUpCompleted;

    try {
      const response = await fetch(
        `/api/reminders/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not update the follow-up."
        );
      }

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? { ...item, followUpCompleted: completed }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update the follow-up."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingFollowUps = applications.filter(
    (item) => item.followUpDate && !item.followUpCompleted
  );

  const overdueFollowUps = pendingFollowUps.filter((item) =>
    isOverdue(item.followUpDate)
  );

  const upcomingInterviews = applications.filter(
    (item) =>
      item.interviewDate &&
      new Date(item.interviewDate).getTime() >= Date.now()
  );

  const completedFollowUps = applications.filter(
    (item) => item.followUpDate && item.followUpCompleted
  );

  const sortedApplications = [...applications].sort((a, b) => {
    const aDate = Math.min(
      a.followUpCompleted || !a.followUpDate
        ? Infinity
        : new Date(a.followUpDate).getTime(),
      a.interviewDate
        ? new Date(a.interviewDate).getTime()
        : Infinity
    );

    const bDate = Math.min(
      b.followUpCompleted || !b.followUpDate
        ? Infinity
        : new Date(b.followUpDate).getTime(),
      b.interviewDate
        ? new Date(b.interviewDate).getTime()
        : Infinity
    );

    return aDate - bDate;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-blue-300">
            Stay organized
          </p>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Application Reminders
          </h1>

          <p className="mt-3 text-slate-400">
            Keep track of interviews, follow-ups, and pending actions.
          </p>
        </div>

        <Link
          href="/dashboard/applications"
          className="inline-flex w-fit items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
        >
          View Applications
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-slate-400">
          Loading your reminders...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Pending Follow-ups"
              value={pendingFollowUps.length}
              description="Still need your attention"
            />

            <SummaryCard
              title="Overdue"
              value={overdueFollowUps.length}
              description="Follow-ups past their date"
            />

            <SummaryCard
              title="Upcoming Interviews"
              value={upcomingInterviews.length}
              description="Scheduled from now onward"
            />

            <SummaryCard
              title="Completed Follow-ups"
              value={completedFollowUps.length}
              description="Marked as completed"
            />
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <h2 className="text-xl font-semibold text-white">
                No reminders yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add an interview date or follow-up date to one of your
                applications to see it here.
              </p>

              <Link
                href="/dashboard/applications"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Open Applications
              </Link>
            </div>
          ) : (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Your Schedule
              </h2>

              {sortedApplications.map((application) => {
                const followUpOverdue = isOverdue(
                  application.followUpDate,
                  application.followUpCompleted
                );

                const interviewOverdue = isOverdue(
                  application.interviewDate
                );

                return (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {application.company}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {application.role}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Status: {application.status}
                        </p>
                      </div>

                      <Link
                        href="/dashboard/applications"
                        className="text-sm font-medium text-blue-300 hover:text-blue-200"
                      >
                        View application →
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {application.interviewDate && (
                        <div className="rounded-xl border border-white/10 p-4">
                          <p className="text-sm font-medium text-slate-300">
                            Interview
                          </p>

                          <p className="mt-2 text-sm text-white">
                            {formatDate(application.interviewDate)}
                          </p>

                          {interviewOverdue && (
                            <p className="mt-2 text-xs font-medium text-red-300">
                              Scheduled date has passed
                            </p>
                          )}
                        </div>
                      )}

                      {application.followUpDate && (
                        <div className="rounded-xl border border-white/10 p-4">
                          <p className="text-sm font-medium text-slate-300">
                            Follow-up
                          </p>

                          <p className="mt-2 text-sm text-white">
                            {formatDate(application.followUpDate)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            {application.followUpCompleted ? (
                              <span className="text-xs font-medium text-green-300">
                                Completed
                              </span>
                            ) : followUpOverdue ? (
                              <span className="text-xs font-medium text-red-300">
                                Overdue
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-blue-300">
                                Pending
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={
                                updatingId === application.id
                              }
                              onClick={() =>
                                void toggleFollowUp(application)
                              }
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                            >
                              {updatingId === application.id
                                ? "Saving..."
                                : application.followUpCompleted
                                  ? "Undo"
                                  : "Mark completed"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
