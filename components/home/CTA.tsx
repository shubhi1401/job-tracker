import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function CTA() {
  return (
    <section id="cta" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-blue-300/20 bg-gradient-to-br from-blue-600/25 via-slate-950 to-cyan-500/10 p-10 text-center shadow-glow sm:p-16">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">
          Start smarter today
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
          Ready to Accelerate Your Career?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Build a clear job search system, improve every application, and make
          your next career move with confidence.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <PrimaryButton href="#home">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryButton>
          <PrimaryButton href="#features" variant="secondary">
            Learn More
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
