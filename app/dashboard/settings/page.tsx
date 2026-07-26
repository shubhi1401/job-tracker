import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { DashboardPlaceholder } from "@/app/dashboard/DashboardPlaceholder";

export const metadata: Metadata = {
  title: "Resume | JobTracker AI"
};

export default function ResumePage() {
  return (
    <DashboardPlaceholder
      title="Resume"
      description="This page will contain resume analysis and resume match tools later. For now, it is a UI-only placeholder connected from the dashboard sidebar."
      icon={FileText}
    />
  );
}
