import type { Metadata } from "next";
import { ActivityTimeline } from "@/app/dashboard/ActivityTimeline";
import { CalendarPanel } from "@/app/dashboard/CalendarPanel";
import { DashboardSidebar } from "@/app/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/app/dashboard/DashboardTopbar";
import { MobileDashboardNav } from "@/app/dashboard/MobileDashboardNav";
import { RecentApplicationsTable } from "@/app/dashboard/RecentApplicationsTable";
import { StatsGrid } from "@/app/dashboard/StatsGrid";
import { UpcomingInterviews } from "@/app/dashboard/UpcomingInterviews";
export const metadata: Metadata = {
  title: "Dashboard | JobTracker AI",
  description: "AI-powered job tracking dashboard layout."
};
export default function DashboardPage() {
  return (
  <>
    <StatsGrid />

    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <RecentApplicationsTable />
        <ActivityTimeline />
      </div>

      <aside className="space-y-6">
        <CalendarPanel />
        <UpcomingInterviews />
      </aside>
    </div>
  </>
);
}