import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ResumeManagerClient from "./ResumeManagerClient";

export const metadata: Metadata = {
  title: "Resumes | JobTracker AI",
};

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const records = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, createdAt: true },
  });

  const initialResumes = records.map((r) => ({
    id: r.id,
    fileName: r.fileName,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ResumeManagerClient initialResumes={initialResumes} />;
}
