import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";
import { DashboardPlaceholder } from "@/app/dashboard/DashboardPlaceholder";

export const metadata: Metadata = {
  title: "Applications | JobTracker AI"
};

export default function ApplicationsPage() {
  return (
    <DashboardPlaceholder
      title="Applications"
      description="This page will show all job applications later. For now, it is a UI-only placeholder connected from the dashboard sidebar."
      icon={BriefcaseBusiness}
    />
  );
}
