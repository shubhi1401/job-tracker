import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import RegisterForm from "./RegisterForm";
export const metadata: Metadata = {
  title: "Register | JobTracker AI",
  description: "Create a new JobTracker AI account.",
};
export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Start your career command center"
      title="Create your AI-powered job search workspace."
      description="Register to organize applications, improve your resume match, manage referrals, and prepare for every interview with confidence."
    >
      <RegisterForm />
    </AuthShell>
  );
}