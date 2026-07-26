import Link from "next/link";
import type { Metadata } from "next";
import { Lock, Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/Authlnput";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
export const metadata: Metadata = {
  title: "Login | JobTracker AI",
  description: "Login to your JobTracker AI account."
};
export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Continue your smarter job search."
      description="Sign in to track your applications, resume insights, referrals, interviews, and career analytics from one premium dashboard."
    >
      <AuthCard
        title="Login"
        subtitle="Enter your details to access your workspace."
        footerText="New to JobTracker AI?"
        footerLinkLabel="Create an account"
        footerHref="/register"
      >
        <form className="space-y-5">
          <AuthInput
            id="email"
            label="Email"
            icon={Mail}
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <AuthInput
            id="password"
            label="Password"
            icon={Lock}
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            minLength={8}
            required
          />
          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-3 text-slate-300">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-500/30"
              />
              Remember me
            </label>
            <Link
              href="#"
              className="font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-500 px-5 py-3.5 text-sm font-bold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:bg-blue-400"
          >
            Login
          </button>
        </form>
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton />
      </AuthCard>
    </AuthShell>
  );
}
