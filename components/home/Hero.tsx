import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { DashboardMockup } from "@/components/home/DashboardMockup";
export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28 lg:px-8"
    >
      <div className="absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-100 backdrop-blur">
            <TrendingUp className="h-4 w-4 text-blue-300" />
            AI-powered career command center
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Land Your Dream Job with{" "}
            <span className="bg-gradient-to-r from-blue-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Track applications, manage referrals, analyze resumes, generate
            cover letters, and prepare for interviews—all in one platform.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href="#cta">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </PrimaryButton>
            <PrimaryButton href="/dashboard" variant="secondary">
              View Demo
            </PrimaryButton>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            {["No credit card", "AI insights", "Portfolio-ready UI"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-300" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}
