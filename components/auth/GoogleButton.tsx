export function GoogleButton() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-white/[0.08]"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-black text-slate-950">
        G
      </span>
      Continue with Google
    </button>
  );
}
