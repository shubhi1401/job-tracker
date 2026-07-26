import { Sparkles } from "lucide-react";

type SectionBadgeProps = {
  children: React.ReactNode;
};

export function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200 shadow-glow backdrop-blur">
      <Sparkles className="h-4 w-4" />
      {children}
    </div>
  );
}
