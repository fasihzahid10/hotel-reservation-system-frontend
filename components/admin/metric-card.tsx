import { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}
