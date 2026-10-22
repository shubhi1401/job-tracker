
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RemindersManager from "./RemindersManager";

export const metadata: Metadata = {
  title: "Reminders | JobTracker AI",
};

export default async function RemindersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <RemindersManager />;
}
