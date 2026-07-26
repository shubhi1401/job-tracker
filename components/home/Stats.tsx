import { stats } from "@/lib/data";

export function Stats() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/[0.04] to-cyan-400/10 p-5 shadow-glow backdrop-blur md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="animate-pulse-glow rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:bg-slate-900/80"
            style={{ animationDelay: `${index * 180}ms` }}
          >
            <stat.icon className="mx-auto mb-4 h-7 w-7 text-blue-300" />
            <p className="text-3xl font-black text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
