import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { DashboardPlaceholder } from "@/app/dashboard/DashboardPlaceholder";
export const metadata: Metadata = {
  title: "Analytics | JobTracker AI"
};
export default function AnalyticsPage() {
  return (
    <DashboardPlaceholder
      title="Analytics"
      description="This page will show charts and job search insights later. For now, it is a UI-only placeholder connected from the dashboard sidebar."
      icon={BarChart3}
    />
  );
}