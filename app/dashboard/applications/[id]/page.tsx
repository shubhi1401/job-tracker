import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ApplicationDetailClient from "./ApplicationDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return { title: "Application | JobTracker AI" };
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { company: true, role: true },
  });

  if (!app) return { title: "Application Not Found | JobTracker AI" };

  return {
    title: `${app.role} at ${app.company} | JobTracker AI`,
    description: `Manage interview status, notes, and preparation for ${app.role} at ${app.company}.`,
  };
}

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

  const formattedApplication = {
    id: application.id,
    company: application.company,
    role: application.role,
    location: application.location,
    salary: application.salary,
    jobUrl: application.jobUrl,
    status: application.status,
    recruiterName: application.recruiterName,
    recruiterEmail: application.recruiterEmail,
    applicationDate: application.applicationDate.toISOString(),
    interviewDate: application.interviewDate ? application.interviewDate.toISOString() : null,
    followUpDate: application.followUpDate ? application.followUpDate.toISOString() : null,
    followUpCompleted: application.followUpCompleted,
    notes: application.notes,
    createdAt: application.createdAt.toISOString(),
  };

  return <ApplicationDetailClient initialApplication={formattedApplication} />;
}
