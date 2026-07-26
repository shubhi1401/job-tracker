import { steps } from "@/lib/data";
import { SectionBadge } from "@/components/ui/SectionBadge";

export function HowItWorks() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge>How it works</SectionBadge>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            From application to interview-ready
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-blue-400 via-blue-500/40 to-transparent md:left-1/2" />
          <div className="space-y-8">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={`relative grid gap-6 md:grid-cols-2 ${
                  index % 2 === 0 ? "" : "md:[&>div:first-child]:col-start-2"
                }`}
              >
                <div
                  className={`ml-14 rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 md:ml-0 ${
                    index % 2 === 0 ? "md:mr-12" : "md:ml-12"
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-2xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div className="absolute left-0 top-7 grid h-10 w-10 place-items-center rounded-full border border-blue-300/40 bg-blue-500 shadow-glow md:left-1/2 md:-translate-x-1/2">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
