'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

export default function CheckInOutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-[#121d2f] to-[#0c1528] text-sky-300">
            <ClipboardList className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0c1528]">Check-in / Check-out</h1>
            <p className="mt-1 text-slate-500">Operate arrivals and departures from reservations.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <h2 className="font-display text-lg font-bold text-slate-900">How it works</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Open the Reservations list to see today&apos;s arrivals and in-house guests.</li>
          <li>Use check-in and check-out actions on each reservation (when exposed by your API role).</li>
          <li>After checkout, housekeeping can move rooms to Cleaning, then Available on the Rooms page.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/reservations" className="button-primary inline-flex rounded-xl px-5 py-3">
            Go to Reservations
          </Link>
          <Link href="/dashboard/rooms" className="button-secondary inline-flex rounded-xl px-5 py-3">
            Manage Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}
