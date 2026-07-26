import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
};
export function AuthInput({
  label,
  icon: Icon,
  id,
  className = "",
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-200"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          className={`w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-500/15 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
