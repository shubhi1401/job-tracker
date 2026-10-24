import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | JobTracker AI",
  description: "Manage your JobTracker AI profile and credentials.",
};

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
          resumes: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const initialUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    applicationsCount: user._count.applications,
    resumesCount: user._count.resumes,
  };

  return <SettingsClient initialUser={initialUser} />;
}
