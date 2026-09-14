import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | JobTracker AI",
  description: "Login to your JobTracker AI account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Continue your smarter job search."
      description="Sign in to track your applications, resume insights, referrals, interviews, and career analytics from one premium dashboard."
    >
      <LoginForm />
    </AuthShell>
  );
}