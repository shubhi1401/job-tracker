import { ReactNode } from "react";
import { DashboardSidebar } from "@/app/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/app/dashboard/DashboardTopbar";
import { MobileDashboardNav } from "@/app/dashboard/MobileDashboardNav";
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-midnight text-white">
      <div className="flex">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">
          <DashboardTopbar />
          <MobileDashboardNav />
          <div className="space-y-6 p-5 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}