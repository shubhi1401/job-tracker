import { BriefcaseBusiness } from "lucide-react";
import { navLinks } from "@/lib/data";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500 shadow-glow">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            JobTracker <span className="text-blue-300">AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>
        <div className=" hidden items-center gap-3 sm:flex">
          <a
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Login
          </a>
          <PrimaryButton href="/register" className="px-5 py-2.5">
            Get Started
          </PrimaryButton>
        </div>
      </nav>
    </header>
  );
}
