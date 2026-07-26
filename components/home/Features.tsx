import { features } from "@/lib/data";
import { SectionBadge } from "@/components/ui/SectionBadge";

export function Features() {
  return (
    <section id="features" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge>Smart job search features</SectionBadge>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Everything you need to run a sharper job search
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            A complete toolkit for tracking, improving, and understanding every
            move in your career pipeline.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 shadow-xl shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-blue-300/40 hover:bg-white/[0.08]"
            >
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/15 text-blue-300 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
