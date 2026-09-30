import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function DetailSection({
  id,
  eyebrow,
  title,
  lead,
  icon: Icon,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
        <Icon className="h-4 w-4" />
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
