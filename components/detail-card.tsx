type DetailCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function DetailCard({ label, value, hint }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 break-words text-base font-semibold text-slate-950">{value}</dd>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p> : null}
    </div>
  );
}
