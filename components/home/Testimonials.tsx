import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionBadge } from "@/components/ui/SectionBadge";

export function Testimonials() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge>Testimonials</SectionBadge>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Built for serious job seekers
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-300/40 hover:bg-white/[0.08]"
            >
              <Quote className="mb-6 h-8 w-8 text-blue-300" />
              <p className="leading-8 text-slate-300">
                “{testimonial.quote}”
              </p>
              <div className="mt-7 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 font-bold text-slate-950">
                  {testimonial.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
