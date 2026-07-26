import { trustedCompanies } from "@/lib/data";

export function TrustedBy() {
  return (
    <section className="px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Trusted by ambitious candidates targeting teams at
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {trustedCompanies.map((company) => (
            <div
              key={company}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm font-bold text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:text-white"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
