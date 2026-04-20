import Link from 'next/link';
import { ReactNode } from 'react';
import clsx from 'clsx';

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  /** When set, the whole card is a link (keyboard + pointer friendly). */
  href?: string;
};

export function MetricCard({ label, value, helper, icon, href }: MetricCardProps) {
  const inner = (
    <>
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
    </>
  );

  const shellClass = clsx(
    'block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition',
    href && 'cursor-pointer hover:border-sky-300/60 hover:shadow-[0_12px_40px_-14px_rgba(14,116,188,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
  );

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        {inner}
      </Link>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}
