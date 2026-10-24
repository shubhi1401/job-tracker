import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import InterviewPrepTool from "./InterviewPrepTool";

export const metadata: Metadata = {
  title: "Interview Prep | JobTracker AI",
  description: "AI-generated STAR behavioral and technical interview questions.",
};

export default async function InterviewPrepPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      company: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <InterviewPrepTool applications={applications} />;
}
