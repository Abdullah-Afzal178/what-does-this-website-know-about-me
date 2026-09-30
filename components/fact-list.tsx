import { DetailCard } from "@/components/detail-card";

export type Fact = { label: string; value: string; hint?: string };

export function FactList({ facts }: { facts: Fact[] }) {
  const shown = facts.filter((fact) => fact.value.trim() !== "");

  if (shown.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Nothing could be determined here.
      </p>
    );
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map((fact) => (
        <DetailCard key={fact.label} label={fact.label} value={fact.value} hint={fact.hint} />
      ))}
    </dl>
  );
}
