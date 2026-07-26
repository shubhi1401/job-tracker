import Link from "next/link";
type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: React.ReactNode;
};
export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerHref,
  children
}: AuthCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-blue-950/50 backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      {children}
      <p className="mt-8 text-center text-sm text-slate-400">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-semibold text-blue-300 transition hover:text-blue-200"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
