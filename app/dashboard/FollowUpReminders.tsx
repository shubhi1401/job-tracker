
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FollowUpActions } from "./FollowUpActions";

export async function FollowUpReminders() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const reminders = await prisma.application.findMany({
    where: {
      userId: user.id,
      followUpDate: { not: null },
      followUpCompleted: false,
      status: { notIn: ["OFFER", "REJECTED"] },
    },
    orderBy: { followUpDate: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getReminderStatus(date: Date) {
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() < today.getTime()) {
      return { label: "Overdue", color: "text-rose-300 bg-rose-500/10" };
    }

    if (dueDate.getTime() === today.getTime()) {
      return { label: "Due today", color: "text-amber-300 bg-amber-500/10" };
    }

    return { label: "Upcoming", color: "text-blue-300 bg-blue-500/10" };
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Follow-up Reminders
          </h2>
          <p className="text-sm text-slate-400">
            Keep track of recruiter follow-ups.
          </p>
        </div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
          {reminders.length} pending
        </span>
      </div>

      {reminders.length === 0 ? (
        <p className="rounded-lg bg-white/[0.03] p-4 text-sm text-slate-400">
          No pending follow-ups. Add a follow-up date to an application to see it here.
        </p>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const status = getReminderStatus(reminder.followUpDate!);

            return (
              <div
                key={reminder.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">{reminder.company}</p>
                  <p className="text-sm text-slate-400">{reminder.role}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Follow up: {reminder.followUpDate!.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>

                  <Link
                    href={`/dashboard/applications/${reminder.id}`}
                    className="text-sm font-semibold text-blue-300 hover:text-blue-200"
                  >
                    View
                  </Link>

                  <FollowUpActions id={reminder.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/dashboard/applications"
        className="inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
      >
        View all applications →
      </Link>
    </section>
  );
}
