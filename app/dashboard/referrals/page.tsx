import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getReferrals } from "@/lib/referrals-storage";
import ReferralsClient from "./ReferralsClient";

export const metadata: Metadata = {
  title: "Referrals & Outreach | JobTracker AI",
  description: "Track employee referrals, networking contacts, and recruiter chats to accelerate your job hunt.",
};

export default async function ReferralsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [referrals, applications] = await Promise.all([
    getReferrals(user.id),
    prisma.application.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        company: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <ReferralsClient
      initialReferrals={referrals}
      applications={applications}
    />
  );
}
