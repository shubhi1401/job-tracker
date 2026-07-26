import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
type PrimaryButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary";
};
export function PrimaryButton({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: PrimaryButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-blue-500 text-white shadow-glow hover:bg-blue-400"
      : "border border-white/15 bg-white/5 text-slate-100 hover:border-blue-300/50 hover:bg-white/10";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${styles} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
