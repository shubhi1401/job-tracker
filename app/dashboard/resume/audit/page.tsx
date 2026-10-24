import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ResumeAuditTool from "./ResumeAuditTool";

export const metadata: Metadata = {
  title: "Resume ATS Audit | JobTracker AI",
  description: "Comprehensive ATS parseability and clarity audit for your resume.",
};

export default async function ResumeAuditPage({
  searchParams,
}: {
  searchParams?: Promise<{ resumeId?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialResumeId = resolvedSearchParams?.resumeId;

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      fileName: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <ResumeAuditTool resumes={resumes} initialResumeId={initialResumeId} />;
}
