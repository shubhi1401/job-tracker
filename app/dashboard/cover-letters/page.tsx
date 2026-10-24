import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CoverLetterTool from "./CoverLetterTool";

export const metadata: Metadata = {
  title: "Cover Letters | JobTracker AI",
  description: "Generate tailored, professional cover letters using AI.",
};

export default async function CoverLettersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [applications, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        company: true,
        role: true,
        notes: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        fileName: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <CoverLetterTool
      applications={applications}
      resumes={resumes}
    />
  );
}
