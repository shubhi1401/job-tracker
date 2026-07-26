import { FaTwitter, FaLinkedinIn, FaGithub} from "react-icons/fa6";
import { Mail } from "lucide-react";
const footerLinks = {
  Product: ["Features", "Pricing", "Demo", "Roadmap"],
  Resources: ["Blog", "Resume Guide", "Interview Prep", "Help Center"],
  Contact: ["hello@jobtracker.ai", "Support", "Careers", "Partnerships"]
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <h3 className="text-2xl font-black text-white">
            JobTracker <span className="text-blue-300">AI</span>
          </h3>
          <p className="mt-4 max-w-sm leading-7 text-slate-400">
            A premium AI workspace for tracking applications, optimizing resumes,
            and landing interviews faster.
          </p>
          <div className="mt-6 flex gap-3">
            {[FaTwitter, FaLinkedinIn, FaGithub, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social link"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-1 hover:border-blue-300/40 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 transition hover:text-blue-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 JobTracker AI. All rights reserved.</p>
        <p>Built with Next.js, TypeScript, Tailwind CSS, and lucide-react.</p>
      </div>
    </footer>
  );
}
