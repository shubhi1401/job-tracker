
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export async function OverdueFollowUpBadge() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const count = await prisma.application.count({
    where: {
      userId: user.id,
      followUpDate: { lt: startOfToday },
      followUpCompleted: false,
      status: { notIn: ["OFFER", "REJECTED"] },
    },
  });

  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
        count > 0
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : "border-white/10 bg-white/[0.05] text-slate-300"
      }`}
    >
      <span aria-hidden="true">🔔</span>
      {count > 0
        ? `${count} overdue follow-up${count === 1 ? "" : "s"}`
        : "No overdue follow-ups"}
    </Link>
  );
}
