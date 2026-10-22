
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ResumeMatchTool from "./ResumeMatchTool";

export const metadata: Metadata = {
  title: "Resume Match | JobTracker AI",
};

export default async function ResumeMatchPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ResumeMatchTool />;
}
