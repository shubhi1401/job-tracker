import Link from "next/link";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};
export function AuthShell({
  children,
  eyebrow,
  title,
  description
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-midnight px-6 py-8 text-white lg:px-8">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500 shadow-glow">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            JobTracker <span className="text-blue-300">AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-300/40 hover:text-white"
        >
          Back Home
        </Link>
      </nav>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-xl text-5xl font-black tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            {description}
          </p>
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-blue-950/40 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["128", "Applications"],
                ["42%", "Interview Rate"],
                ["18%", "Offer Rate"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
